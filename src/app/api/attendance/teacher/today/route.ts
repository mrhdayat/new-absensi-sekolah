import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@/generated/prisma";

// GET /api/attendance/teacher/today - Get today's attendance status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher record for current user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher record not found" },
        { status: 404 }
      );
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.teacherAttendance.findUnique({
      where: {
        teacherId_date: {
          teacherId: teacher.id,
          date: today,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: attendance,
      isCheckedIn: !!attendance?.checkIn,
      isCheckedOut: !!attendance?.checkOut,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST /api/attendance/teacher/today - Check in or check out
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, latitude, longitude, notes } = body;

    if (!action || !["check-in", "check-out"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'check-in' or 'check-out'" },
        { status: 400 }
      );
    }

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

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get school settings for time validation
    const settings = await prisma.schoolSettings.findFirst();

    if (action === "check-in") {
      // 1. Check if Teacher is on Approved Leave
      const activeLeave = await prisma.teacherLeaveRequest.findFirst({
        where: {
          teacherId: teacher.id,
          status: "APPROVED",
          startDate: { lte: today },
          endDate: { gte: today },
        },
      });

      if (activeLeave) {
        return NextResponse.json(
          { error: "Anda tidak dapat melakukan Absen Masuk karena sedang dalam masa Cuti." },
          { status: 400 }
        );
      }

      // Check if already checked in
      const existing = await prisma.teacherAttendance.findUnique({
        where: {
          teacherId_date: {
            teacherId: teacher.id,
            date: today,
          },
        },
      });

      if (existing?.checkIn) {
        return NextResponse.json(
          { error: "Anda sudah absen masuk hari ini" },
          { status: 400 }
        );
      }

      // Determine status based on time
      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      if (settings) {
        // CORRECTION: Use attendanceStartTime for LATE calculation
        // settings.attendanceStartTime usually denotes when school STARTS (e.g. 07:00)

        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startMinutes = settings.attendanceStartTime.getHours() * 60 +
          settings.attendanceStartTime.getMinutes();

        // Threshold: Start Time + Late Threshold Minutes (Defined in DB)
        // Defaulting to 15 mins if not present to be safe, though DB default is 30
        const lateThreshold = startMinutes + (settings.lateThresholdMinutes || 15);

        if (currentTime > lateThreshold) {
          status = AttendanceStatus.LATE;
        }
      }

      // Create or update attendance
      const attendance = await prisma.teacherAttendance.upsert({
        where: {
          teacherId_date: {
            teacherId: teacher.id,
            date: today,
          },
        },
        update: {
          checkIn: now,
          status,
          latitude,
          longitude,
          notes,
        },
        create: {
          teacherId: teacher.id,
          date: today,
          checkIn: now,
          status,
          latitude,
          longitude,
          notes,
        },
      });

      return NextResponse.json({
        success: true,
        message: status === AttendanceStatus.LATE
          ? "Absen masuk berhasil (Terlambat)"
          : "Absen masuk berhasil",
        data: attendance,
      });
    } else {
      // Check out
      const existing = await prisma.teacherAttendance.findUnique({
        where: {
          teacherId_date: {
            teacherId: teacher.id,
            date: today,
          },
        },
      });

      if (!existing?.checkIn) {
        return NextResponse.json(
          { error: "Anda belum absen masuk hari ini" },
          { status: 400 }
        );
      }

      if (existing.checkOut) {
        return NextResponse.json(
          { error: "Anda sudah absen pulang hari ini" },
          { status: 400 }
        );
      }

      const attendance = await prisma.teacherAttendance.update({
        where: {
          teacherId_date: {
            teacherId: teacher.id,
            date: today,
          },
        },
        data: {
          checkOut: now,
          notes: notes || existing.notes,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Absen pulang berhasil",
        data: attendance,
      });
    }
  } catch (error) {
    console.error("Error processing attendance:", error);
    return NextResponse.json(
      { error: "Failed to process attendance" },
      { status: 500 }
    );
  }
}
