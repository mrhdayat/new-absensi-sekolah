import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    if (type === "profile") {
      // Create a schema that excludes email for this operation
      const profileUpdateSchema = z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        avatar: z.string().optional().nullable(),
      });

      const validation = profileUpdateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.error.issues },
          { status: 400 }
        );
      }

      const { name, avatar } = validation.data;

      // Update user profile (excluding email)
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          avatar,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          module: "USER_PROFILE",
          recordId: session.user.id,
          oldData: {
            name: session.user.name,
          },
          newData: {
            name,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: "Profil berhasil diperbarui",
      });
    } else if (type === "password") {
      const validation = updatePasswordSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.error.issues },
          { status: 400 }
        );
      }

      const { currentPassword, newPassword } = validation.data;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Password saat ini salah" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          password: hashedPassword,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          module: "USER_PASSWORD",
          recordId: session.user.id,
          newData: {
            message: "Password changed successfully",
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Password berhasil diubah",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid update type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
