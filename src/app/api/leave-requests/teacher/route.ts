import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const teacherLeaveSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  type: z.enum(["SICK", "FAMILY", "OTHER"]),
  reason: z.string().min(10),
  attachment: z.string().optional(),
});

// GET /api/leave-requests/teacher - Get teacher leave requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const teacherId = searchParams.get("teacherId");

    let where: any = {};

    // Teachers can only see their own leaves
    if (session.user.role === "TEACHER" || session.user.role === "HOMEROOM_TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });
      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      }
      where.teacherId = teacher.id;
    }

    // Principal/Admin can see all or filter by teacherId
    if (teacherId && ["PRINCIPAL", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      where.teacherId = teacherId;
    }

    if (status) {
      where.status = status;
    }

    const leaveRequests = await prisma.teacherLeaveRequest.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        approvedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: leaveRequests,
    });
  } catch (error) {
    console.error("Error fetching teacher leave requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

// POST /api/leave-requests/teacher - Create teacher leave request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only teachers can create leave requests
    if (!["TEACHER", "HOMEROOM_TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = teacherLeaveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { startDate, endDate, type, reason, attachment } = validation.data;

    // Create leave request
    const leaveRequest = await prisma.teacherLeaveRequest.create({
      data: {
        teacherId: teacher.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        attachment,
        status: "PENDING",
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        module: "TEACHER_LEAVE_REQUEST",
        recordId: leaveRequest.id,
        newData: {
          startDate,
          endDate,
          type,
          reason,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: leaveRequest,
    });
  } catch (error) {
    console.error("Error creating teacher leave request:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}
