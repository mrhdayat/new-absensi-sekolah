import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@/generated/prisma";

// GET /api/attendance/student - Get students for attendance by schedule
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId is required" },
        { status: 400 }
      );
    }

    // Get schedule with class and students
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        class: {
          include: {
            students: {
              where: { status: "ACTIVE" },
              include: {
                user: {
                  select: {
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { nis: "asc" },
            },
          },
        },
        subject: true,
        teacher: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Get existing attendance for this date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const existingAttendances = await prisma.studentAttendance.findMany({
      where: {
        scheduleId,
        date: targetDate,
      },
    });

    const attendanceMap = new Map(
      existingAttendances.map((a) => [a.studentId, a])
    );

    // Combine students with their attendance
    const studentsWithAttendance = schedule.class.students.map((student) => ({
      id: student.id,
      nis: student.nis,
      name: student.user.name,
      avatar: student.user.avatar,
      gender: student.gender,
      attendance: attendanceMap.get(student.id) || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        schedule: {
          id: schedule.id,
          class: schedule.class.name,
          subject: schedule.subject.name,
          teacher: schedule.teacher.user.name,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
        },
        date: targetDate.toISOString(),
        students: studentsWithAttendance,
        totalStudents: studentsWithAttendance.length,
        attendedCount: existingAttendances.filter(
          (a) => a.status === "PRESENT" || a.status === "LATE"
        ).length,
      },
    });
  } catch (error) {
    console.error("Error fetching students for attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST /api/attendance/student - Submit student attendance
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId, date, attendances } = body;

    if (!scheduleId || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json(
        { error: "scheduleId and attendances array are required" },
        { status: 400 }
      );
    }

    // Validate schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const targetDate = new Date(date || new Date());
    targetDate.setHours(0, 0, 0, 0);

    // 1. Integrity Check: Verify if any student has APPROVED LEAVE for this date
    const studentIds = attendances.map((a: any) => a.studentId);
    const conflictingLeaves = await prisma.leaveRequest.findMany({
      where: {
        studentId: { in: studentIds },
        status: "APPROVED",
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
      include: { student: { include: { user: { select: { name: true } } } } }
    });

    // If trying to mark PRESENT/LATE for a student on leave, block it
    const conflicts = conflictingLeaves.filter(leave => {
      const attempt = attendances.find((a: any) => a.studentId === leave.studentId);
      return attempt && ["PRESENT", "LATE"].includes(attempt.status);
    });

    if (conflicts.length > 0) {
      const names = conflicts.map(c => c.student.user.name).join(", ");
      return NextResponse.json(
        { error: `Tidak dapat mengubah status menjadi Hadir/Terlambat. Siswa berikut sedang dalam masa cuti yang disetujui: ${names}` },
        { status: 400 }
      );
    }

    // Process each attendance
    const results = await Promise.all(
      attendances.map(
        async (item: {
          studentId: string;
          status: AttendanceStatus;
          notes?: string;
        }) => {
          // Check existing first to determine if we should award XP
          const existing = await prisma.studentAttendance.findUnique({
            where: {
              studentId_scheduleId_date: {
                studentId: item.studentId,
                scheduleId,
                date: targetDate,
              },
            },
          });

          const result = await prisma.studentAttendance.upsert({
            where: {
              studentId_scheduleId_date: {
                studentId: item.studentId,
                scheduleId,
                date: targetDate,
              },
            },
            update: {
              status: item.status,
              notes: item.notes,
              recordedById: session.user.id,
            },
            create: {
              studentId: item.studentId,
              scheduleId,
              date: targetDate,
              status: item.status,
              notes: item.notes,
              recordedById: session.user.id,
            },
          });

          // GAMIFICATION TRIGGER
          // Award XP if:
          // 1. New record AND status is PRESENT/LATE
          // 2. Existing record was NOT PRESENT/LATE and now IS PRESENT/LATE
          const isPresentOrLate = item.status === "PRESENT" || item.status === "LATE";
          const wasPresentOrLate = existing && (existing.status === "PRESENT" || existing.status === "LATE");

          if (isPresentOrLate && !wasPresentOrLate) {
            // Determine XP Amount
            // Present: 10 XP
            // Late: 5 XP
            const xpAmount = item.status === "PRESENT" ? 10 : 5;
            const reason = item.status === "PRESENT" ? "Hadir Tepat Waktu" : "Hadir (Terlambat)";

            // Allow async processing (fire and forget to not slow down response?)
            // Ideally await it to ensure consistency, but loop might be slow.
            // Using await for safety.
            try {
              const { GamificationService } = await import("@/lib/gamification");
              await GamificationService.addXP(item.studentId, xpAmount, reason);
            } catch (err) {
              console.error("Gamification Error:", err);
            }
          }

          return result;
        }
      )
    );

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        module: "STUDENT_ATTENDANCE",
        recordId: scheduleId,
        newData: {
          scheduleId,
          date: targetDate.toISOString(),
          count: attendances.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menyimpan absensi ${results.length} siswa`,
      data: results,
    });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    return NextResponse.json(
      { error: "Failed to submit attendance" },
      { status: 500 }
    );
  }
}
