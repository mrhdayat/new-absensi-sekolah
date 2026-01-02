import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  schoolName: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  attendanceStartTime: z.string(), // HH:mm format
  attendanceEndTime: z.string(),
  gracePeriodMinutes: z.number().min(0),
  lateThresholdMinutes: z.number().min(0),
  enableLocationTracking: z.boolean(),
});

// Helper to convert HH:mm to Date
function timeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date("1970-01-01");
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// GET /api/settings - Get school settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.schoolSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Convert times to HH:mm format for frontend
    const startTime = settings.attendanceStartTime;
    const endTime = settings.attendanceEndTime;

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        attendanceStartTime: `${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`,
        attendanceEndTime: `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT /api/settings - Update school settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    const settings = await prisma.schoolSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    const updated = await prisma.schoolSettings.update({
      where: { id: settings.id },
      data: {
        schoolName: data.schoolName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        attendanceStartTime: timeToDate(data.attendanceStartTime),
        attendanceEndTime: timeToDate(data.attendanceEndTime),
        gracePeriodMinutes: data.gracePeriodMinutes,
        lateThresholdMinutes: data.lateThresholdMinutes,
        enableLocationTracking: data.enableLocationTracking,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        module: "SETTINGS",
        recordId: updated.id,
        newData: data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
