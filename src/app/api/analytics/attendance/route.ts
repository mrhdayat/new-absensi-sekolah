import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/attendance - Get attendance analytics
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
    const days = parseInt(searchParams.get("days") || "7");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days + 1);

    // Get daily student attendance for the period
    const studentAttendance = await prisma.studentAttendance.groupBy({
      by: ["date", "status"],
      where: {
        date: {
          gte: startDate,
          lte: today,
        },
      },
      _count: true,
    });

    // Get daily teacher attendance for the period
    const teacherAttendance = await prisma.teacherAttendance.groupBy({
      by: ["date", "status"],
      where: {
        date: {
          gte: startDate,
          lte: today,
        },
      },
      _count: true,
    });

    // Format data for charts
    const dateRange: Date[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dateRange.push(date);
    }

    const studentTrendData = dateRange.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayData = studentAttendance.filter(
        (a) => new Date(a.date).toISOString().split("T")[0] === dateStr
      );

      const present = dayData.find((d) => d.status === "PRESENT")?._count || 0;
      const late = dayData.find((d) => d.status === "LATE")?._count || 0;
      const sick = dayData.find((d) => d.status === "SICK")?._count || 0;
      const permitted = dayData.find((d) => d.status === "PERMITTED")?._count || 0;
      const absent = dayData.find((d) => d.status === "ABSENT")?._count || 0;

      const total = present + late + sick + permitted + absent;
      const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

      return {
        date: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        present,
        late,
        sick,
        permitted,
        absent,
        total,
        attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      };
    });

    const teacherTrendData = dateRange.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayData = teacherAttendance.filter(
        (a) => new Date(a.date).toISOString().split("T")[0] === dateStr
      );

      const present = dayData.find((d) => d.status === "PRESENT")?._count || 0;
      const late = dayData.find((d) => d.status === "LATE")?._count || 0;
      const sick = dayData.find((d) => d.status === "SICK")?._count || 0;
      const permitted = dayData.find((d) => d.status === "PERMITTED")?._count || 0;
      const absent = dayData.find((d) => d.status === "ABSENT")?._count || 0;

      const total = present + late + sick + permitted + absent;
      const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

      return {
        date: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        present,
        late,
        sick,
        permitted,
        absent,
        total,
        attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      };
    });

    // Get class-wise comparison (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            attendances: {
              where: {
                date: {
                  gte: sevenDaysAgo,
                  lte: today,
                },
              },
            },
          },
        },
      },
    });

    const classComparison = classes.map((cls) => {
      const allAttendances = cls.students.flatMap((s) => s.attendances);
      const totalRecords = allAttendances.length;
      const presentRecords = allAttendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length;
      const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

      return {
        className: cls.name,
        attendanceRate: parseFloat(attendanceRate.toFixed(1)),
        totalStudents: cls.students.length,
        totalRecords,
        presentRecords,
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    return NextResponse.json({
      success: true,
      data: {
        studentTrend: studentTrendData,
        teacherTrend: teacherTrendData,
        classComparison,
        period: {
          startDate: startDate.toISOString(),
          endDate: today.toISOString(),
          days,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching attendance analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
