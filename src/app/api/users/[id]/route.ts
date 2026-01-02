import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "TEACHER", "HOMEROOM_TEACHER", "PRINCIPAL", "STUDENT"]).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,

        teacher: {
          select: {
            id: true,
            nip: true,
            phone: true,
            status: true,
          },
        },
        student: {
          select: {
            id: true,
            nis: true,
            nisn: true,
            gender: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PATCH /api/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, isActive, studentData, teacherData } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      isActive,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Transaction for atomic update
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update User
      const user = await tx.user.update({
        where: { id },
        data: updateData,
      });

      // Update Role Specific Data
      if (role === "STUDENT" && studentData) {
        await tx.student.upsert({
          where: { userId: id },
          update: {
            nis: studentData.nis,
            nisn: studentData.nisn,
            classId: studentData.classId,
            gender: studentData.gender,
            // Student doesn't have own phone in schema, only parentPhone
            parentPhone: studentData.parentPhone,
            birthDate: studentData.birthDate ? new Date(studentData.birthDate) : undefined,
          },
          create: {
            userId: id,
            nis: studentData.nis,
            nisn: studentData.nisn,
            classId: studentData.classId,
            gender: studentData.gender,
            parentPhone: studentData.parentPhone,
            birthDate: studentData.birthDate ? new Date(studentData.birthDate) : undefined,
            status: "ACTIVE",
          },
        });
      } else if ((role === "TEACHER" || role === "HOMEROOM_TEACHER") && teacherData) {
        await tx.teacher.upsert({
          where: { userId: id },
          update: {
            nip: teacherData.nip,
            // Teacher doesn't have gender in schema
            phone: teacherData.phone,
            address: teacherData.address,

          },
          create: {
            userId: id,
            nip: teacherData.nip,
            phone: teacherData.phone,
            address: teacherData.address,
            status: "ACTIVE",

          },
        });
      }

      return user;
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        module: "USER",
        recordId: id,
        newData: { name, email, role },
        oldData: { name: existingUser.name, email: existingUser.email, role: existingUser.role }
      }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        module: "USER",
        recordId: id,
        oldData: { name: existingUser.name, email: existingUser.email }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
