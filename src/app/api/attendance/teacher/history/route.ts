import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/attendance/teacher/history - Get teacher attendance history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher record not found" },
        { status: 404 }
      );
    }

    // Build date filter
    let dateFilter: { gte?: Date; lte?: Date } = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      dateFilter = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Get attendance records
    const [attendances, total] = await Promise.all([
      prisma.teacherAttendance.findMany({
        where: {
          teacherId: teacher.id,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.teacherAttendance.count({
        where: {
          teacherId: teacher.id,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
      }),
    ]);

    // Calculate statistics
    const stats = await prisma.teacherAttendance.groupBy({
      by: ["status"],
      where: {
        teacherId: teacher.id,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      _count: true,
    });

    const statisticsMap: Record<string, number> = {
      PRESENT: 0,
      LATE: 0,
      SICK: 0,
      PERMITTED: 0,
      ABSENT: 0,
    };

    stats.forEach((stat) => {
      statisticsMap[stat.status] = stat._count;
    });

    return NextResponse.json({
      success: true,
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: statisticsMap,
    });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance history" },
      { status: 500 }
    );
  }
}
