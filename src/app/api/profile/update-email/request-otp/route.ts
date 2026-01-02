import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

// POST /api/profile/update-email/request-otp
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail, currentPassword } = await request.json();

    if (!newEmail || !currentPassword) {
      return NextResponse.json({ error: "Email baru dan Password saat ini wajib diisi" }, { status: 400 });
    }

    if (newEmail === session.user.email) {
      return NextResponse.json({ error: "Email baru tidak boleh sama dengan email lama" }, { status: 400 });
    }

    // 1. Verify Current Password (Security)
    // We need to fetch the user's password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
    }

    // 2. Check if new email is taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email ini sudah digunakan oleh pengguna lain" }, { status: 400 });
    }

    // 3. Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes

    // 4. Save Token (Use Type: EMAIL_CHANGE)
    // We use the NEW EMAIL as the identifier, so we know which email to verify
    await prisma.verificationToken.deleteMany({
      where: { identifier: newEmail, type: "EMAIL_CHANGE" }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: newEmail,
        token: code,
        expires,
        type: "EMAIL_CHANGE"
      }
    });

    // 5. Send Email to NEW Address
    await sendOtpEmail(newEmail, code, "Verifikasi Perubahan Email");

    return NextResponse.json({
      success: true,
      message: "Kode OTP telah dikirim ke email BARU Anda."
    });

  } catch (error) {
    console.error("Request Update Email Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
