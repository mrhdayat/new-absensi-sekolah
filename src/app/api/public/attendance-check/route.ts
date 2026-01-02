import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/public/attendance-check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nis, birthDate } = body;

    // 1. Validation
    if (!nis || !birthDate) {
      return NextResponse.json(
        { error: "NIS dan Tanggal Lahir wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Find Student with matching NIS and BirthDate
    // We need to join with User to check birthDate usually, OR check student table.
    // Let's check Schema. `Student` has `birthDate`?
    // Based on previous files, `Student` usually has `birthDate` or it might be on `User`.
    // Let's assume it's on Student based on standard schema, or User.
    // Wait, let's verify schema first to be safe?
    // I'll take a peek at schema in next step if this fails, but usually `Student` model has `birthDate`.
    // Actually, looking at `src/app/api/homeroom/my-class/route.ts` previously viewed content:
    // `birthDate: student.birthDate` was mapped. So `Student` has `birthDate`.

    const student = await prisma.student.findFirst({
      where: {
        nis: nis,
        // birthDate is DateTime in DB.
        // We need to compare specific date.
        // Prisma compare might need exact ISO string or Date object.
        // "2006-05-20" -> new Date("2006-05-20")
      },
      include: {
        user: { select: { name: true } },
        class: { select: { name: true } },
        attendances: true // Need all for stats
      }
    });

    if (!student || !student.birthDate) {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan. Periksa NIS dan Tanggal Lahir." },
        { status: 404 }
      );
    }

    // Verify BirthDate with Timezone Tolerance (Indonesia = UTC+7/8/9)
    // DB might store 2010-12-08 as 2010-12-07T17:00:00Z (WIB) or 2010-12-07T16:00:00Z (WITA)
    const inputDatePart = new Date(birthDate).toISOString().split("T")[0]; // Input is YYYY-MM-DD

    // Check against UTC, WIB (+7), WITA (+8), WIT (+9)
    const dbTime = new Date(student.birthDate).getTime();

    // Helper to format timestamp to YYYY-MM-DD in specific offset
    const formatOffset = (ms: number, offsetHours: number) => {
      const d = new Date(ms + (offsetHours * 3600 * 1000));
      return d.toISOString().split("T")[0];
    };

    const matchUTC = formatOffset(dbTime, 0) === inputDatePart;
    const matchWIB = formatOffset(dbTime, 7) === inputDatePart;
    const matchWITA = formatOffset(dbTime, 8) === inputDatePart;
    const matchWIT = formatOffset(dbTime, 9) === inputDatePart;

    if (!matchUTC && !matchWIB && !matchWITA && !matchWIT) {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan. Periksa NIS dan Tanggal Lahir." },
        { status: 404 }
      );
    }

    // 3. Calculate Stats
    const totalAttendances = student.attendances.length;
    const presentCount = student.attendances.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
    const sickCount = student.attendances.filter(a => a.status === "SICK").length;
    const permitCount = student.attendances.filter(a => a.status === "PERMITTED").length;
    const alphaCount = student.attendances.filter(a => a.status === "ABSENT").length;

    // Calculate Attendance Rate (Present + Late) / Total Schedules * 100?
    // Or just based on records?
    // Let's stick to records for public check to be simple.
    // Or maybe Total School Days?
    // For now: (Present / Total Records) * 100
    const rate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        name: student.user.name,
        className: student.class?.name || "-",
        stats: {
          rate,
          present: presentCount,
          sick: sickCount,
          permit: permitCount,
          alpha: alphaCount
        }
      }
    });

  } catch (error) {
    console.error("Public Attendance Check Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
