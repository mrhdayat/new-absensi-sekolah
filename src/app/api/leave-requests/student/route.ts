import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const studentLeaveSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  type: z.enum(["SICK", "FAMILY", "OTHER"]),
  reason: z.string().min(10),
  attachment: z.string().optional(),
});

// GET /api/leave-requests/student - Get student leave requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const studentId = searchParams.get("studentId");

    let where: any = {};

    // Students can only see their own leaves
    if (session.user.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      where.studentId = student.id;
    }

    // Homeroom teachers can see leaves from their class students
    if (session.user.role === "HOMEROOM_TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          homeroomClasses: {
            include: {
              students: true,
            },
          },
        },
      });

      if (!teacher || teacher.homeroomClasses.length === 0) {
        return NextResponse.json({ error: "No homeroom class found" }, { status: 404 });
      }

      const studentIds = teacher.homeroomClasses.flatMap((cls) =>
        cls.students.map((s) => s.id)
      );
      where.studentId = { in: studentIds };
    }

    // Admin/Principal can see all or filter by studentId
    if (studentId && ["PRINCIPAL", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      where.studentId = studentId;
    }

    if (status) {
      where.status = status;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
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
    console.error("Error fetching student leave requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

// POST /api/leave-requests/student - Create student leave request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can create leave requests
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = studentLeaveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { startDate, endDate, type, reason, attachment } = validation.data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Logic Check: Overlapping Leaves
    const existingLeave = await prisma.leaveRequest.findFirst({
      where: {
        studentId: student.id,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          // New start date is within existing range
          {
            startDate: { lte: start },
            endDate: { gte: start },
          },
          // New end date is within existing range
          {
            startDate: { lte: end },
            endDate: { gte: end },
          },
          // Existing range is fully inside new range
          {
            startDate: { gte: start },
            endDate: { lte: end },
          },
        ],
      },
    });

    if (existingLeave) {
      return NextResponse.json(
        { error: "Anda sudah memiliki pengajuan cuti (Pending/Disetujui) pada rentang tanggal tersebut." },
        { status: 400 }
      );
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        attachment,
        status: "PENDING",
      },
      include: {
        student: {
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
        module: "STUDENT_LEAVE_REQUEST",
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
    console.error("Error creating student leave request:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}
