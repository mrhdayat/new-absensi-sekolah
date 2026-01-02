import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GamificationService } from "@/lib/gamification";

// GET /api/gamification/leaderboard
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Top 10 Profiles
    const topProfiles = await prisma.gamificationProfile.findMany({
      take: 10,
      orderBy: [
        { level: "desc" },
        { xp: "desc" },
      ],
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            // Maybe fetch class? Student -> Class
            student: {
              select: {
                class: { select: { name: true } }
              }
            }
          }
        },
        badges: {
          select: { id: true } // just count
        }
      }
    });

    const leaderboard = topProfiles.map((p, index) => ({
      rank: index + 1,
      name: p.user.name,
      avatar: p.user.avatar,
      className: p.user.student?.class?.name || "-",
      level: p.level,
      xp: p.xp,
      title: GamificationService.getTitle(p.level),
      points: p.points,
      badgesCount: p.badges.length
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
