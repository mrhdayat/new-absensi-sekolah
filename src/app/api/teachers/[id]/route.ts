import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teachers/[id] - Get single teacher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        homeroomClasses: {
          include: {
            academicYear: true,
          },
        },
        schedules: {
          include: {
            class: true,
            subject: true,
          },
        },
        attendances: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher" },
      { status: 500 }
    );
  }
}

// PUT /api/teachers/[id] - Update teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, phone, address, status } = body;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    const oldData = { name: teacher.user.name, phone: teacher.phone, status: teacher.status };

    const result = await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { name },
        });
      }

      return tx.teacher.update({
        where: { id },
        data: {
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(status && { status }),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        module: "TEACHER",
        recordId: id,
        oldData,
        newData: { name, phone, status },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data guru berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/[id] - Delete teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Delete user (will cascade to teacher)
    await prisma.user.delete({
      where: { id: teacher.userId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        module: "TEACHER",
        recordId: id,
        oldData: { email: teacher.user.email, nip: teacher.nip },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data guru berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
