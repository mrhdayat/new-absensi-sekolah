import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/subjects/[id] - Update subject
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { code, name, description } = body;

    const oldSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!oldSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check code uniqueness if changing
    if (code && code !== oldSubject.code) {
      const existing = await prisma.subject.findUnique({
        where: { code },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Subject code already exists" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        module: "SUBJECT",
        recordId: updated.id,
        oldData: oldSubject,
        newData: { code, name, description },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subject updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}

// DELETE /api/subjects/[id] - Delete subject
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (subject._count.schedules > 0) {
      return NextResponse.json(
        { error: "Cannot delete subject with existing schedules" },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        module: "SUBJECT",
        recordId: id,
        oldData: { code: subject.code, name: subject.name },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}
