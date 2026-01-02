import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { studentSchema } from "@/lib/validations";
import { UserRole, StudentStatus } from "@/generated/prisma";

// GET /api/students - List all students
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
    let classId = searchParams.get("classId");
    const status = searchParams.get("status") as StudentStatus | null;

    // SECURITY: Role-based filtering
    if (["TEACHER", "HOMEROOM_TEACHER"].includes(session.user.role)) {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          homeroomClasses: { select: { id: true } },
          schedules: { select: { classId: true } }
        }
      });

      if (!teacher) return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });

      const allowedClassIds = new Set([
        ...teacher.homeroomClasses.map(c => c.id),
        ...teacher.schedules.map(s => s.classId)
      ]);

      if (classId) {
        if (!allowedClassIds.has(classId)) {
          return NextResponse.json({ error: "Forbidden: You do not have access to this class" }, { status: 403 });
        }
      } else {
        // If no specific class requested, limit to ALL allowed classes
        // This prevents dumping the entire student database
        // @ts-ignore
        where.classId = { in: Array.from(allowedClassIds) };
      }
    }

    const where: any = {
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { nis: { contains: search } },
          { nisn: { contains: search } },
        ],
      }),
      // Only add classId to where if it was explicitly provided (and validated above)
      ...(classId && { classId }),
      ...(status && { status }),
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isActive: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
            },
          },
        },
        orderBy: [{ class: { name: "asc" } }, { nis: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST /api/students - Create new student
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, nis, nisn, classId, parentPhone, gender, birthDate, status } = validation.data;

    // Check existing
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const existingNis = await prisma.student.findUnique({ where: { nis } });
    if (existingNis) {
      return NextResponse.json({ error: "NIS sudah terdaftar" }, { status: 400 });
    }

    // Check Class Capacity
    if (classId) {
      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        include: { _count: { select: { students: true } } },
      });

      if (!classInfo) {
        return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 400 });
      }

      if (classInfo._count.students >= classInfo.capacity) {
        return NextResponse.json(
          { error: `Kelas ${classInfo.name} sudah penuh (${classInfo._count.students}/${classInfo.capacity}).` },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password!, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: UserRole.STUDENT,
          isActive: true,
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          nis,
          nisn,
          classId,
          parentPhone,
          gender,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          status: status || StudentStatus.ACTIVE,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          class: { select: { id: true, name: true } },
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        module: "STUDENT",
        recordId: result.id,
        newData: { email, name, nis },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Siswa berhasil ditambahkan",
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
