import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/academic-years
export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "TEACHER" && session.user.role !== "HOMEROOM_TEACHER")) {
      // Teachers might need to see list, but only Admin manages it.
      // Allow reading for authenticated users generally if needed for dropdowns?
      // Let's restrict to authenticated.
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const years = await prisma.academicYear.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: years,
    });
  } catch (error) {
    console.error("GET Academic Years Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/academic-years
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Only Admin/Super Admin
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, startDate, endDate, isActive } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Transaction: If isActive is true, deactivate all others first
    const result = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.academicYear.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const newYear = await tx.academicYear.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive || false,
        },
      });

      return newYear;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Tahun ajaran berhasil ditambahkan",
    });
  } catch (error) {
    console.error("POST Academic Year Error:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Nama tahun ajaran sudah ada" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menambahkan tahun ajaran" }, { status: 500 });
  }
}
