import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/homeroom/students/[id] - Get detailed student info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session?.user || session.user.role !== "HOMEROOM_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify this student is in homeroom teacher's class
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        homeroomClasses: {
          include: {
            students: {
              where: { id },
            },
          },
        },
      },
    });

    if (
      !teacher ||
      teacher.homeroomClasses.length === 0 ||
      teacher.homeroomClasses[0].students.length === 0
    ) {
      return NextResponse.json(
        { error: "Student not found in your homeroom class" },
        { status: 404 }
      );
    }

    // Get detailed student data
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        class: {
          select: {
            name: true,
            grade: true,
          },
        },
        attendances: {
          orderBy: {
            date: "desc",
          },
          take: 30,
          include: {
            schedule: {
              include: {
                subject: true,
              },
            },
          },
        },
        leaveRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Calculate stats
    const last30Days = student.attendances;
    const totalDays = last30Days.length;
    const presentDays = last30Days.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE"
    ).length;
    const lateDays = last30Days.filter((a) => a.status === "LATE").length;
    const sickDays = last30Days.filter((a) => a.status === "SICK").length;
    const permittedDays = last30Days.filter((a) => a.status === "PERMITTED").length;
    const absentDays = last30Days.filter((a) => a.status === "ABSENT").length;

    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Group attendances by status for chart
    const attendanceByStatus = {
      PRESENT: last30Days.filter((a) => a.status === "PRESENT").length,
      LATE: lateDays,
      SICK: sickDays,
      PERMITTED: permittedDays,
      ABSENT: absentDays,
    };

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          nis: student.nis,
          nisn: student.nisn,
          name: student.user.name,
          email: student.user.email,
          gender: student.gender,
          birthDate: student.birthDate,
          parentPhone: student.parentPhone,

          status: student.status,
          class: student.class,
        },
        stats: {
          attendanceRate: Math.round(attendanceRate * 10) / 10,
          totalDays,
          presentDays,
          lateDays,
          sickDays,
          permittedDays,
          absentDays,
          attendanceByStatus,
        },
        recentAttendances: last30Days.slice(0, 10),
        leaveRequests: student.leaveRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}
