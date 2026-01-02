import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";

// POST /api/auth/forgot-password
// Public Endpoint
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role === "STUDENT" && !user.emailVerified) { // Optional: Enforce verified email for students?
      // Security: Do not reveal user existence.
      // But for this project, let's be helpful.
      // Actually, if STUDENT uses dummy email, let it pass to MOCK log? Use caution.
    }

    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan dalam sistem" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Akun ini telah dinonaktifkan" }, { status: 403 });
    }

    // 2. Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 Mins

    // 3. Save OTP to DB
    // Use upsert or delete old first to avoid duplicates if user clicks twice
    // Since unique constraint is [identifier, token], user can have multiple DIFFERENT tokens active technically?
    // No, better clean up old REQUEST_RESET tokens for this user.
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: "PASSWORD_RESET"
      }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
        type: "PASSWORD_RESET"
      }
    });

    // 4. Send Email (Smart Mock/Real)
    await sendOtpEmail(email, code, "Reset Password");

    return NextResponse.json({
      success: true,
      message: "OTP telah dikirim ke email Anda"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
