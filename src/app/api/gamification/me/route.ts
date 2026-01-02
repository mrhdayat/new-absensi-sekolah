import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/gamification/me
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's gamification profile with badges
    // If not exists, create one (lazy initialization for old users)
    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        badges: {
          include: {
            badge: true
          }
        }
      }
    });

    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: {
          userId: session.user.id,
          xp: 0,
          level: 1,
          points: 0
        },
        include: {
          badges: {
            include: {
              badge: true
            }
          }
        }
      });
    }

    // Calculate level progress
    // Assume simple formula: Level = floor(sqrt(XP / 100)) + 1 ???
    // Or just return raw XP and let frontend visualize.
    // Let's use standard RPG curve:
    // Level 1: 0-100 XP
    // Level 2: 101-300 XP (Diff 200)
    // Level 3: 301-600 XP (Diff 300)

    // For now, let's just return the raw data and badges.

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error("Gamification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
