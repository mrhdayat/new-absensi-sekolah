import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scheduleSchema = z.object({
  classId: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string(), // HH:mm format
  endTime: z.string(),
  room: z.string().optional(),
});

// Helper to convert HH:mm to Date for comparison
function timeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date("1970-01-01");
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Check for schedule conflicts
async function checkConflicts(data: any, excludeId?: string) {
  const startTime = timeToDate(data.startTime);
  const endTime = timeToDate(data.endTime);

  const conflicts = await prisma.schedule.findMany({
    where: {
      ...(excludeId && { id: { not: excludeId } }),
      dayOfWeek: data.dayOfWeek,
      OR: [
        { teacherId: data.teacherId },
        { classId: data.classId },
        ...(data.room ? [{ room: data.room }] : []),
      ],
    },
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true } },
      teacher: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  const timeConflicts = conflicts.filter((schedule) => {
    const existingStart = new Date(schedule.startTime);
    const existingEnd = new Date(schedule.endTime);

    // Check if times overlap
    return (
      (startTime >= existingStart && startTime < existingEnd) ||
      (endTime > existingStart && endTime <= existingEnd) ||
      (startTime <= existingStart && endTime >= existingEnd)
    );
  });

  return timeConflicts;
}

// GET /api/schedules - Enhanced with mySchedules filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mySchedules = searchParams.get("mySchedules") === "true";
    const classId = searchParams.get("classId") || "";
    const teacherId = searchParams.get("teacherId") || "";
    const dayOfWeek = searchParams.get("dayOfWeek") || "";

    const where: any = {};

    if (mySchedules) {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });
      if (teacher) {
        where.teacherId = teacher.id;
      } else {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
    }

    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true, code: true } },
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

// POST /api/schedules - Create schedule with conflict detection
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for conflicts
    const conflicts = await checkConflicts(data);
    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      let conflictType = "";
      let conflictName = "";

      if (conflict.teacherId === data.teacherId) {
        conflictType = "Guru";
        conflictName = conflict.teacher.user.name;
      } else if (conflict.classId === data.classId) {
        conflictType = "Kelas";
        conflictName = conflict.class.name;
      } else if (data.room && conflict.room === data.room) {
        conflictType = "Ruangan";
        conflictName = conflict.room;
      }

      return NextResponse.json(
        {
          error: `Konflik jadwal: ${conflictType} ${conflictName} sudah terpakai oleh ${conflict.subject.name} pada waktu yang sama`,
          conflicts,
        },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        dayOfWeek: data.dayOfWeek,
        startTime: timeToDate(data.startTime),
        endTime: timeToDate(data.endTime),
        room: data.room || "",
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        module: "SCHEDULE",
        recordId: schedule.id,
        newData: data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil dibuat",
      data: schedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
