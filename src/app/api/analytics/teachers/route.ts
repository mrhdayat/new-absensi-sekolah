import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/teachers - Get comprehensive teacher analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Principal, Admin can access
    if (!["PRINCIPAL", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days + 1);

    // If specific teacher requested
    const teacherId = searchParams.get("teacherId");

    // Get all teachers with their data (or filter if ID)
    const teachers = await prisma.teacher.findMany({
      where: {
        ...(teacherId && { id: teacherId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Get attendance data for all teachers in the period (or filter)
    const attendanceData = await prisma.teacherAttendance.findMany({
      where: {
        ...(teacherId && { teacherId }),
        date: {
          gte: startDate,
          lte: today,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Get today's attendance
    const todayAttendance = attendanceData.filter(
      (a) => a.date.toDateString() === today.toDateString()
    );

    // Get leave requests
    const leaveRequests = await prisma.teacherLeaveRequest.findMany({
      where: {
        startDate: {
          gte: startDate,
        },
      },
    });

    // Calculate statistics for each teacher
    const teacherStats = teachers.map((teacher) => {
      const teacherAttendances = attendanceData.filter(
        (a) => a.teacherId === teacher.id
      );
      const teacherLeaves = leaveRequests.filter(
        (l) => l.teacherId === teacher.id
      );

      const totalDays = teacherAttendances.length;
      const presentDays = teacherAttendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length;
      const onTimeDays = teacherAttendances.filter(
        (a) => a.status === "PRESENT"
      ).length;
      const lateDays = teacherAttendances.filter(
        (a) => a.status === "LATE"
      ).length;
      const sickDays = teacherAttendances.filter(
        (a) => a.status === "SICK"
      ).length;
      const permittedDays = teacherAttendances.filter(
        (a) => a.status === "PERMITTED"
      ).length;
      const absentDays = teacherAttendances.filter(
        (a) => a.status === "ABSENT"
      ).length;

      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      const punctualityRate = totalDays > 0 ? (onTimeDays / totalDays) * 100 : 0;

      // Get today's status
      const todayRecord = todayAttendance.find(
        (a) => a.teacherId === teacher.id
      );
      const todayStatus = todayRecord?.status || "ABSENT";

      // Count pending leave requests
      const pendingLeaves = teacherLeaves.filter(
        (l) => l.status === "PENDING"
      ).length;

      return {
        id: teacher.id,
        nip: teacher.nip,
        user: teacher.user,
        subject: "-", // We'll add this later if needed
        todayStatus,
        stats: {
          totalDays,
          presentDays,
          onTimeDays,
          lateDays,
          sickDays,
          permittedDays,
          absentDays,
          attendanceRate: parseFloat(attendanceRate.toFixed(1)),
          punctualityRate: parseFloat(punctualityRate.toFixed(1)),
          pendingLeaves,
        },
        recentAttendances: teacherAttendances.slice(0, 7),
      };
    });

    // Overall statistics
    const totalTeachers = teachers.length;
    const todayPresent = todayAttendance.filter(
      (a) => a.status === "PRESENT"
    ).length;
    const todayLate = todayAttendance.filter((a) => a.status === "LATE").length;
    const todaySick = todayAttendance.filter((a) => a.status === "SICK").length;
    const todayPermitted = todayAttendance.filter(
      (a) => a.status === "PERMITTED"
    ).length;
    const todayAbsent = totalTeachers - todayAttendance.length;

    const overallAttendanceRate =
      teacherStats.reduce((sum, t) => sum + t.stats.attendanceRate, 0) /
      (totalTeachers || 1);
    const overallPunctualityRate =
      teacherStats.reduce((sum, t) => sum + t.stats.punctualityRate, 0) /
      (totalTeachers || 1);

    // Sort teachers by attendance rate
    const sortedByAttendance = [...teacherStats].sort(
      (a, b) => b.stats.attendanceRate - a.stats.attendanceRate
    );

    // If requesting specific teacher detail
    if (teacherId && teacherStats.length > 0) {
      return NextResponse.json({
        success: true,
        data: teacherStats[0]
      });
    }

    // Top performers (top 5)
    const topPerformers = sortedByAttendance.slice(0, 5);

    // Low performers (attendance < 80%)
    const lowPerformers = teacherStats
      .filter((t) => t.stats.attendanceRate < 80)
      .sort((a, b) => a.stats.attendanceRate - b.stats.attendanceRate);

    // Return all data
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalTeachers,
          todayPresent,
          todayLate,
          todaySick,
          todayPermitted,
          todayAbsent,
          attendanceRate: parseFloat(overallAttendanceRate.toFixed(1)),
          punctualityRate: parseFloat(overallPunctualityRate.toFixed(1)),
        },
        todayAttendance: todayAttendance.map((a) => ({
          id: a.id,
          teacherId: a.teacherId,
          status: a.status,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
        })),
        teachers: teacherStats,
        topPerformers,
        lowPerformers,
        period: {
          startDate: startDate.toISOString(),
          endDate: today.toISOString(),
          days,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching teacher analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher analytics" },
      { status: 500 }
    );
  }
}
