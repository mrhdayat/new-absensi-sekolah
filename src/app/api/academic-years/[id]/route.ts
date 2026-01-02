import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function validateAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return null;
  }
  return session;
}

// GET /api/academic-years/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const year = await prisma.academicYear.findUnique({
      where: { id },
    });

    if (!year) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: year });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/academic-years/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await validateAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, startDate, endDate, isActive } = body;

    const result = await prisma.$transaction(async (tx) => {
      // If setting to active, deactivate others
      if (isActive) {
        await tx.academicYear.updateMany({
          where: { id: { not: id }, isActive: true },
          data: { isActive: false },
        });
      }

      // Check if we are turning off the ONLY active year?
      // Strict rule: Must always have one active? 
      // User didn't specify, but it's good practice. 
      // For now allow turning off, but system might need one.

      const updated = await tx.academicYear.update({
        where: { id },
        data: {
          name,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          isActive,
        },
      });
      return updated;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Tahun ajaran berhasil diupdate",
    });
  } catch (error) {
    console.error("PUT Academic Year Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate tahun ajaran" }, { status: 500 });
  }
}

// DELETE /api/academic-years/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await validateAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Check relations
    const year = await prisma.academicYear.findUnique({
      where: { id },
      include: { classes: true },
    });

    if (!year) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (year.classes.length > 0) {
      return NextResponse.json({
        error: "Tidak dapat menghapus tahun ajaran yang masih memiliki kelas terdaftar."
      }, { status: 400 });
    }

    if (year.isActive) {
      return NextResponse.json({
        error: "Tidak dapat menghapus tahun ajaran yang sedang aktif. Ganti status aktif ke tahun lain terlebih dahulu."
      }, { status: 400 });
    }

    await prisma.academicYear.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Tahun ajaran berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE Academic Year Error:", error);
    return NextResponse.json({ error: "Gagal menghapus tahun ajaran" }, { status: 500 });
  }
}
