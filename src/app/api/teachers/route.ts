import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { teacherSchema } from "@/lib/validations";
import { UserRole, TeacherStatus } from "@/generated/prisma";

// GET /api/teachers - List all teachers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as TeacherStatus | null;

    const where = {
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { nip: { contains: search } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
      ...(status && { status }),
    };

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isActive: true,
              lastLogin: true,
            },
          },
          homeroomClasses: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              schedules: true,
              homeroomClasses: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.teacher.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: teachers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

// POST /api/teachers - Create new teacher
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin/super admin can create teachers
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = teacherSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, nip, phone, address, status } = validation.data;

    // Check if email or NIP already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { nip } });
    if (existingTeacher) {
      return NextResponse.json(
        { error: "NIP sudah terdaftar" },
        { status: 400 }
      );
    }

    // Create user and teacher in transaction
    const hashedPassword = await bcrypt.hash(password!, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: UserRole.TEACHER,
          isActive: true,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          nip,
          phone,
          address,
          status: status || TeacherStatus.ACTIVE,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return teacher;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        module: "TEACHER",
        recordId: result.id,
        newData: { email, name, nip },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Guru berhasil ditambahkan",
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}
