import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/profile/update-email/verify
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail, code } = await request.json();

    if (!newEmail || !code) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Verify Token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: newEmail, // Token was saved under new email
        token: code,
        type: "EMAIL_CHANGE",
        expires: { gt: new Date() }
      }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Kode OTP salah atau kadaluwarsa" }, { status: 400 });
    }

    // 2. Double check if email taken (in case race condition)
    const taken = await prisma.user.findUnique({ where: { email: newEmail } });
    if (taken) {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }

    // 3. Update User Email
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: newEmail,
        emailVerified: new Date() // It's verified now
      }
    });

    // 4. Cleanup Token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: newEmail,
          token: code
        }
      }
    });

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_EMAIL",
        module: "PROFILE",
        newData: { new_email: newEmail }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Email berhasil diperbarui!"
    });

  } catch (error) {
    console.error("Verify Update Email Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
