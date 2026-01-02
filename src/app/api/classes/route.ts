import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classes - List all classes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const grade = searchParams.get("grade") || "";

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (grade) {
      where.grade = grade;
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        homeroomTeacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        academicYear: {
          select: {
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

// POST /api/classes - Create new class
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, grade, homeroomTeacherId, capacity, academicYearId } = body;

    // Validation
    if (!name || !grade) {
      return NextResponse.json({ error: "Name and grade are required" }, { status: 400 });
    }

    // Get active academic year if not provided
    let yearId = academicYearId;
    if (!yearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
      });
      if (!activeYear) {
        return NextResponse.json({ error: "No active academic year found" }, { status: 400 });
      }
      yearId = activeYear.id;
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        homeroomTeacherId,
        capacity: capacity || 30,
        academicYearId: yearId,
      },
      include: {
        homeroomTeacher: {
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        module: "CLASS",
        recordId: newClass.id,
        newData: { name, grade, homeroomTeacherId, capacity },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
