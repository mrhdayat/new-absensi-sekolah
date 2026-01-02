import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reports/attendance - Attendance analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["PRINCIPAL", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const classId = searchParams.get("classId") || "";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Build where clause
    const where: any = {
      date: {
        gte: startDate,
      },
    };

    if (classId) {
      where.student = {
        classId,
      };
    }

    // Get all attendance records
    const attendances = await prisma.studentAttendance.findMany({
      where,
      include: {
        student: {
          include: {
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate daily stats
    const dailyStats: Record<string, any> = {};
    attendances.forEach((att) => {
      const dateKey = att.date.toISOString().split("T")[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          total: 0,
          present: 0,
          late: 0,
          sick: 0,
          permitted: 0,
          absent: 0,
        };
      }

      dailyStats[dateKey].total++;
      if (att.status === "PRESENT") dailyStats[dateKey].present++;
      else if (att.status === "LATE") dailyStats[dateKey].late++;
      else if (att.status === "SICK") dailyStats[dateKey].sick++;
      else if (att.status === "PERMITTED") dailyStats[dateKey].permitted++;
      else if (att.status === "ABSENT") dailyStats[dateKey].absent++;
    });

    // Convert to array and calculate rates
    const dailyTrend = Object.values(dailyStats).map((day: any) => ({
      ...day,
      attendanceRate: day.total > 0 ? Math.round(((day.present + day.late) / day.total) * 100) : 0,
    }));

    // Calculate status distribution
    const statusDistribution = {
      PRESENT: attendances.filter((a) => a.status === "PRESENT").length,
      LATE: attendances.filter((a) => a.status === "LATE").length,
      SICK: attendances.filter((a) => a.status === "SICK").length,
      PERMITTED: attendances.filter((a) => a.status === "PERMITTED").length,
      ABSENT: attendances.filter((a) => a.status === "ABSENT").length,
    };

    // Calculate class breakdown
    const classCounts: Record<string, any> = {};
    attendances.forEach((att) => {
      const className = att.student.class?.name || "No Class";
      if (!classCounts[className]) {
        classCounts[className] = {
          className,
          total: 0,
          present: 0,
        };
      }
      classCounts[className].total++;
      if (att.status === "PRESENT" || att.status === "LATE") {
        classCounts[className].present++;
      }
    });

    const classSummary = Object.values(classCounts).map((cls: any) => ({
      className: cls.className,
      total: cls.total,
      present: cls.present,
      attendanceRate: cls.total > 0 ? Math.round((cls.present / cls.total) * 100) : 0,
    }));

    // Overall stats
    const totalRecords = attendances.length;
    const totalPresent = statusDistribution.PRESENT + statusDistribution.LATE;
    const overallRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    // Calculate trend (compare last 7 days vs previous 7 days)
    const last7Days = dailyTrend.slice(-7);
    const prev7Days = dailyTrend.slice(-14, -7);
    const last7Avg = last7Days.length > 0
      ? last7Days.reduce((sum, d) => sum + d.attendanceRate, 0) / last7Days.length
      : 0;
    const prev7Avg = prev7Days.length > 0
      ? prev7Days.reduce((sum, d) => sum + d.attendanceRate, 0) / prev7Days.length
      : 0;
    const trend = last7Avg - prev7Avg;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRecords,
          totalPresent,
          overallRate,
          trend: Math.round(trend * 10) / 10,
        },
        dailyTrend,
        statusDistribution,
        classSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance report" },
      { status: 500 }
    );
  }
}
