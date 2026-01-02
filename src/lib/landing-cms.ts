import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { cache } from "react";

// Types for our CMS data
export interface LandingData {
  settings: any;
  features: any[];
  roles: any[];
  announcements: any[];
  faqs: any[];
  howItWorks: any[];
}

export const getLandingData = cache(async (): Promise<LandingData> => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return {
      settings: {},
      features: [],
      roles: [],
      announcements: [],
      faqs: [],
      howItWorks: [],
    };
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const [
      settings,
      features,
      roles,
      announcements,
      faqs,
      howItWorks
    ] = await Promise.all([
      prisma.landingPageSettings.findFirst(),
      prisma.landingFeature.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.landingRole.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.landingAnnouncement.findMany({
        where: { isActive: true },
        orderBy: { startDate: "desc" },
        take: 5
      }),
      prisma.landingFAQ.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.landingHowItWorks.findMany({ where: { isActive: true }, orderBy: { stepNumber: "asc" } }),
    ]);

    // Create default settings if not exists (lazy init)
    if (!settings) {
      await prisma.landingPageSettings.create({ data: {} });
    }

    return {
      settings: settings || {},
      features,
      roles,
      announcements,
      faqs,
      howItWorks,
    };
  } catch (error) {
    console.error("Error fetching landing data:", error);
    return {
      settings: {},
      features: [],
      roles: [],
      announcements: [],
      faqs: [],
      howItWorks: [],
    };
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
});
