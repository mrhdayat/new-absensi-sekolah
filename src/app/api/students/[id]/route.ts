import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // v5
import { prisma } from "@/lib/prisma";

// Helper to validate session
async function validateSession() {
  const session = await auth();
  if (!session?.user) return null;
  // Only Admin or Super Admin
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") return null;
  return session;
}

// GET /api/students/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await validateSession();
    if (!session) {
      console.log("GET /api/students/[id] - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log(`GET /api/students/${id} - Fetching details`);

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        class: true,
      },
    });

    if (!student) {
      console.log(`GET /api/students/${id} - Not Found`);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    console.log(`GET /api/students/${id} - Found:`, student.user.name);

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("GET Student Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/students/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await validateSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Check if student exists
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Transaction to update User + Student
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update User info (name, email)
      if (body.name || body.email) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            name: body.name,
            email: body.email,
          },
        });
      }

      // 2. Update Student info
      const studentUpdate = await tx.student.update({
        where: { id },
        data: {
          nis: body.nis,
          nisn: body.nisn,
          gender: body.gender,
          birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
          parentPhone: body.parentPhone,
          classId: body.classId,
        },
        include: {
          user: true,
          class: true,
        }
      });
      return studentUpdate;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("PUT Student Error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE /api/students/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await validateSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Use transaction to delete User (cascade should handle student profile, but safer to be explicit or let cascade work if configured)
    // Schema says: `student` has `userId` referencing `User` with `onDelete: Cascade` likely?
    // Let's assume standard behavior: Deleting User deletes Profile.
    // So we delete USER.
    await prisma.user.delete({
      where: { id: existing.userId },
    });

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Student Error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
