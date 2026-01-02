import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/homeroom/reset-code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOMEROOM_TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    // 1. Verify Teacher & Rate Limit
    // Security: Check if teacher has generated too many codes recently (Rate Limiting)
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await prisma.auditLog.count({
      where: {
        userId: session.user.id,
        action: "GENERATE_RESET_CODE",
        createdAt: { gt: ONE_HOUR_AGO }
      }
    });

    const MAX_RESETS_PER_HOUR = 20; // Allow 20 students per hour max (enough for half a class)
    if (recentLogs >= MAX_RESETS_PER_HOUR) {
      return NextResponse.json({
        error: "Rate Limit Exceeded. Anda hanya dapat mereset 20 siswa per jam. Harap tunggu beberapa saat."
      }, { status: 429 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        homeroomClasses: {
          include: { students: true }
        }
      }
    });

    if (!teacher || teacher.homeroomClasses.length === 0) {
      return NextResponse.json({ error: "Anda bukan Wali Kelas" }, { status: 403 });
    }

    // 2. Verify Student belongs to Teacher's Class
    // Flatten students from all homeroom classes (usually just one)
    const myStudentIds = teacher.homeroomClasses.flatMap(c => c.students.map(s => s.id));

    if (!myStudentIds.includes(studentId)) {
      return NextResponse.json({ error: "Siswa ini bukan di kelas perwalian Anda" }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // 3. Generate 6 Digit Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes

    // 4. Save Token
    // First, remove any existing delegated reset tokens for this student
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: student.user.email,
        type: "DELEGATED_RESET"
      }
    });

    // We use Student Email as identifier for the token
    await prisma.verificationToken.create({
      data: {
        identifier: student.user.email,
        token: code,
        expires,
        type: "DELEGATED_RESET",
      },
    });

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "GENERATE_RESET_CODE",
        module: "AUTH",
        recordId: student.id,
        newData: { code_generated: true, student_name: student.user.name },
      },
    });

    return NextResponse.json({
      success: true,
      code,
      expiresIn: "15 Menit",
      studentName: student.user.name
    });

  } catch (error) {
    console.error("Error generating reset code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
