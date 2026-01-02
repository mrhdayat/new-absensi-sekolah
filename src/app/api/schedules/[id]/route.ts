import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scheduleUpdateSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  room: z.string().optional(),
});

function timeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date("1970-01-01");
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function checkConflicts(data: any, excludeId: string) {
  if (!data.dayOfWeek || !data.startTime || !data.endTime) {
    return [];
  }

  const startTime = timeToDate(data.startTime);
  const endTime = timeToDate(data.endTime);

  const conflicts = await prisma.schedule.findMany({
    where: {
      id: { not: excludeId },
      dayOfWeek: data.dayOfWeek,
      OR: [
        ...(data.teacherId ? [{ teacherId: data.teacherId }] : []),
        ...(data.classId ? [{ classId: data.classId }] : []),
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

    return (
      (startTime >= existingStart && startTime < existingEnd) ||
      (endTime > existingStart && endTime <= existingEnd) ||
      (startTime <= existingStart && endTime >= existingEnd)
    );
  });

  return timeConflicts;
}

// GET /api/schedules/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true, code: true } },
        teacher: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

// PUT /api/schedules/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = scheduleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get current schedule
    const currentSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!currentSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // Merge with current data for conflict check
    const mergedData = {
      classId: data.classId || currentSchedule.classId,
      teacherId: data.teacherId || currentSchedule.teacherId,
      dayOfWeek: data.dayOfWeek || currentSchedule.dayOfWeek,
      startTime: data.startTime || currentSchedule.startTime.toTimeString().slice(0, 5),
      endTime: data.endTime || currentSchedule.endTime.toTimeString().slice(0, 5),
    };

    // Check for conflicts
    const conflicts = await checkConflicts(mergedData, id);
    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      return NextResponse.json(
        {
          error: `Konflik jadwal dengan ${conflict.class.name} - ${conflict.subject.name}`,
          conflicts,
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (data.classId) updateData.classId = data.classId;
    if (data.subjectId) updateData.subjectId = data.subjectId;
    if (data.teacherId) updateData.teacherId = data.teacherId;
    if (data.dayOfWeek) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime) updateData.startTime = timeToDate(data.startTime);
    if (data.endTime) updateData.endTime = timeToDate(data.endTime);
    if (data.room !== undefined) updateData.room = data.room;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
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
        action: "UPDATE",
        module: "SCHEDULE",
        recordId: schedule.id,
        oldData: currentSchedule,
        newData: data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil diupdate",
      data: schedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

// DELETE /api/schedules/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    if (schedule._count.attendances > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus jadwal yang sudah memiliki ${schedule._count.attendances} catatan kehadiran`,
        },
        { status: 400 }
      );
    }

    await prisma.schedule.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        module: "SCHEDULE",
        recordId: id,
        oldData: schedule,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
