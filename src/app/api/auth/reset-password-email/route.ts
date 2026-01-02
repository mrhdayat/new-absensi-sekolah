import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/reset-password-email
export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // 1. Verify Token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        type: "PASSWORD_RESET",
        expires: { gt: new Date() }
      }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Kode OTP salah atau sudah kadaluwarsa" }, { status: 400 });
    }

    // 2. Update User
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        emailVerified: new Date() // Mark verify implicitly? Or strictly keep separate? Let's verify it since they own the email.
      }
    });

    // 3. Cleanup Token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: code
        }
      }
    });

    // 4. Audit
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET_EMAIL",
          module: "AUTH",
          newData: { method: "EMAIL_OTP" }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
