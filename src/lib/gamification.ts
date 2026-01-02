import { prisma } from "@/lib/prisma";

export const LEVEL_TITLES = [
  { min: 1, title: "Pejuang Absen" },
  { min: 5, title: "Ksatria Rajin" },
  { min: 10, title: "Pahlawan Kelas" },
  { min: 20, title: "Legenda Sekolah" },
  { min: 50, title: "Dewa Kehadiran" },
];

export class GamificationService {
  static getTitle(level: number): string {
    const found = [...LEVEL_TITLES].reverse().find(t => level >= t.min);
    return found ? found.title : LEVEL_TITLES[0].title;
  }

  static getNextLevelXP(level: number): number {
    // Current formula: Base 100 + (Level * 50)
    // Level 1: 150
    // Level 2: 200
    // Level 10: 600
    return 100 + (level * 50);
  }

  static async addXP(userId: string, amount: number, reason: string) {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    let newXP = profile.xp + amount;
    let newLevel = profile.level;
    let leveledUp = false;

    // Check Level Up
    // XP spills over
    while (newXP >= this.getNextLevelXP(newLevel)) {
      newXP -= this.getNextLevelXP(newLevel);
      newLevel++;
      leveledUp = true;
    }

    const updatedProfile = await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        xp: newXP,
        level: newLevel,
        lastActivity: new Date(),
        // Add points if needed (1 XP = 1 Point?)
        points: { increment: amount }
      }
    });

    if (leveledUp) {
      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Level Up! 🎉",
          message: `Selamat! Anda naik ke Level ${newLevel}. Gelar baru: ${this.getTitle(newLevel)}`,
          type: "INFO",
        }
      });
    }

    return updatedProfile;
  }

  static async checkAndAwardBadge(userId: string, badgeCode: string) {
    // Check if badge exists
    const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
    if (!badge) return;

    // Check if user already has it
    const profile = await prisma.gamificationProfile.findUnique({ where: { userId } });
    if (!profile) return;

    const existing = await prisma.userBadge.findFirst({
      where: { profileId: profile.id, badgeId: badge.id }
    });

    if (existing) return;

    // Award Badge
    await prisma.userBadge.create({
      data: {
        profileId: profile.id,
        badgeId: badge.id,
      }
    });

    // Award Badge XP
    await this.addXP(userId, badge.xpValue, `Badge: ${badge.name}`);

    // Notify
    await prisma.notification.create({
      data: {
        userId,
        title: "Badge Baru! 🏆",
        message: `Keren! Anda mendapatkan badge "${badge.name}". +${badge.xpValue} XP.`,
        type: "SUCCESS",
      }
    });
  }

  static async updateStreak(userId: string) {
    // Logic to calculate streak based on attendance dates
    // ... reserved for next step
  }
}
