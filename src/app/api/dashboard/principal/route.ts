import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/principal - Get principal dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Principal and Admin can access
    if (!["PRINCIPAL", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's student attendance breakdown
    const studentAttendanceToday = await prisma.studentAttendance.groupBy({
      by: ["status"],
      where: { date: today },
      _count: true,
    });

    const studentStats = {
      PRESENT: 0,
      LATE: 0,
      SICK: 0,
      PERMITTED: 0,
      ABSENT: 0,
    };

    studentAttendanceToday.forEach((item) => {
      studentStats[item.status as keyof typeof studentStats] = item._count;
    });

    const totalStudentRecords = Object.values(studentStats).reduce((a, b) => a + b, 0);
    const studentAttendanceRate = totalStudentRecords > 0
      ? (((studentStats.PRESENT + studentStats.LATE) / totalStudentRecords) * 100).toFixed(1)
      : "0.0";

    // Get today's teacher attendance breakdown
    const teacherAttendanceToday = await prisma.teacherAttendance.groupBy({
      by: ["status"],
      where: { date: today },
      _count: true,
    });

    const teacherStats = {
      PRESENT: 0,
      LATE: 0,
      SICK: 0,
      PERMITTED: 0,
      ABSENT: 0,
    };

    teacherAttendanceToday.forEach((item) => {
      teacherStats[item.status as keyof typeof teacherStats] = item._count;
    });

    const totalTeacherRecords = Object.values(teacherStats).reduce((a, b) => a + b, 0);
    const teacherAttendanceRate = totalTeacherRecords > 0
      ? (((teacherStats.PRESENT + teacherStats.LATE) / totalTeacherRecords) * 100).toFixed(1)
      : "0.0";

    // Get pending teacher leave requests
    const pendingTeacherLeaves = await prisma.teacherLeaveRequest.count({
      where: { status: "PENDING" },
    });

    // Get total counts
    const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.teacher.count({ where: { status: "ACTIVE" } }),
      prisma.class.count(),
    ]);

    // Get low attendance students (< 80% in last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const studentsWithAttendance = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      include: {
        attendances: {
          where: {
            date: {
              gte: thirtyDaysAgo,
              lte: today,
            },
          },
        },
        user: {
          select: { name: true },
        },
        class: {
          select: { name: true },
        },
      },
    });

    const lowAttendanceStudents = studentsWithAttendance
      .map((student) => {
        const totalDays = student.attendances.length;
        const presentDays = student.attendances.filter(
          (a) => a.status === "PRESENT" || a.status === "LATE"
        ).length;
        const rate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

        return {
          id: student.id,
          name: student.user.name,
          className: student.class?.name || "-",
          attendanceRate: rate.toFixed(1),
          totalDays,
          presentDays,
        };
      })
      .filter((s) => parseFloat(s.attendanceRate) < 80)
      .sort((a, b) => parseFloat(a.attendanceRate) - parseFloat(b.attendanceRate))
      .slice(0, 10); // Top 10 lowest

    // Get teacher performance (last 30 days)
    const teachersWithAttendance = await prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      include: {
        attendances: {
          where: {
            date: {
              gte: thirtyDaysAgo,
              lte: today,
            },
          },
        },
        user: {
          select: { name: true },
        },
      },
    });

    const teacherPerformance = teachersWithAttendance.map((teacher) => {
      const totalDays = teacher.attendances.length;
      const presentDays = teacher.attendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length;
      const onTimeDays = teacher.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      const punctualityRate = totalDays > 0 ? (onTimeDays / totalDays) * 100 : 0;

      return {
        id: teacher.id,
        name: teacher.user.name,
        attendanceRate: attendanceRate.toFixed(1),
        punctualityRate: punctualityRate.toFixed(1),
        totalDays,
        presentDays,
        onTimeDays,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalClasses,
          studentAttendanceRate,
          teacherAttendanceRate,
        },
        todayAttendance: {
          students: studentStats,
          teachers: teacherStats,
        },
        pendingApprovals: {
          teacherLeaves: pendingTeacherLeaves,
        },
        alerts: {
          lowAttendanceStudents,
        },
        performance: {
          teachers: teacherPerformance,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching principal dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
