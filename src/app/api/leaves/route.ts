import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/leaves - Get leave requests with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    // Role-based filtering
    if (session.user.role === "STUDENT") {
      // Students see only their own requests
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      where.studentId = student.id;
    } else if (session.user.role === "HOMEROOM_TEACHER") {
      // Homeroom teachers see their class students' requests
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          homeroomClasses: {
            include: {
              students: {
                select: { id: true },
              },
            },
          },
        },
      });

      if (teacher && teacher.homeroomClasses.length > 0) {
        const studentIds = teacher.homeroomClasses[0].students.map((s) => s.id);
        where.studentId = { in: studentIds };
      }
    }
    // PRINCIPAL, ADMIN, SUPER_ADMIN see all

    if (status) {
      where.status = status;
    }

    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: leaves,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

// POST /api/leaves - Create leave request (Student only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, startDate, endDate, reason, attachment } = body;

    if (!type || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        attachment,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Leave request submitted successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}
