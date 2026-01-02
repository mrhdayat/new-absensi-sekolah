import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/reset-password-delegated
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nis, code, newPassword } = body;

    if (!nis || !code || !newPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi (NIS, Kode, Password Baru)" }, { status: 400 });
    }

    // Security: Artificial Delay to prevent Brute Force (Time Attack Mitigation)
    // 2 seconds delay = Max 1800 attempts/hour per thread
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // 1. Find Student by NIS
    const student = await prisma.student.findUnique({
      where: { nis },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: "NIS tidak ditemukan" }, { status: 404 });
    }

    // 2. Verify Token
    // Find valid token for this user's email with correct Type
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: student.user.email,
        token: code,
        type: "DELEGATED_RESET",
        expires: { gt: new Date() } // Must not be expired
      }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Kode OTP salah atau sudah kadaluwarsa" }, { status: 400 });
    }

    // 3. Update Password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: student.user.id },
      data: {
        password: hashedPassword,
        // Optional: Mark verified if not already?
        // emailVerified: new Date(), 
      }
    });

    // 4. Delete used token
    // Actually, Prisma schema has composite unique [identifier, token].
    // Note: If there are multiple identical tokens (rare), delete might need unique ID or deleteMany. 
    // Since we don't have ID in schema provided earlier (oops, I removed default ID? No, I defined `identifier, token` unique).
    // So delete unique is safe.
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: student.user.email,
          token: code
        }
      }
    });

    // 5. Audit Log (System Action)
    // Since user is not logged in, userId is null or we can use the student ID if we want trackability.
    // Ideally we put the student's User ID to show WHO changed it.
    await prisma.auditLog.create({
      data: {
        userId: student.user.id,
        action: "PASSWORD_RESET_DELEGATED",
        module: "AUTH",
        recordId: student.id,
        newData: { method: "HOMEROOM_CODE" },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah. Silakan login dengan password baru."
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Gagal mereset password" }, { status: 500 });
  }
}
