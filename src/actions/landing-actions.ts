"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- SETTINGS ---

export async function updateLandingSettings(data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" };
    }

    const { id, createdAt, updatedAt, ...updates } = data;

    // Find first or create
    const existing = await prisma.landingPageSettings.findFirst();

    if (existing) {
      await prisma.landingPageSettings.update({
        where: { id: existing.id },
        data: updates,
      });
    } else {
      await prisma.landingPageSettings.create({
        data: updates,
      });
    }

    revalidatePath("/welcome");
    return { success: true };
  } catch (error) {
    console.error("Error updating landing settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// --- FEATURES ---

export async function createFeature(data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingFeature.create({ data });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) {
    console.error("CREATE FEATURE ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateFeature(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    const { id: _, createdAt, updatedAt, ...updates } = data;
    await prisma.landingFeature.update({ where: { id }, data: updates });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("UPDATE FEATURE ERROR:", error); return { success: false, error: String(error) }; }
}

export async function deleteFeature(id: string) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingFeature.delete({ where: { id } });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("DELETE FEATURE ERROR:", error); return { success: false, error: String(error) }; }
}

// --- ROLES ---

export async function createRole(data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingRole.create({ data });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("CREATE ROLE ERROR:", error); return { success: false, error: String(error) }; }
}

export async function updateRole(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    const { id: _, createdAt, updatedAt, ...updates } = data;
    await prisma.landingRole.update({ where: { id }, data: updates });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("UPDATE ROLE ERROR:", error); return { success: false, error: String(error) }; }
}

export async function deleteRole(id: string) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingRole.delete({ where: { id } });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("DELETE ROLE ERROR:", error); return { success: false, error: String(error) }; }
}

// --- ANNOUNCEMENTS ---

export async function createAnnouncement(data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingAnnouncement.create({ data });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("CREATE ANNOUNCEMENT ERROR:", error); return { success: false, error: String(error) }; }
}

export async function updateAnnouncement(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    const { id: _, createdAt, updatedAt, ...updates } = data;
    await prisma.landingAnnouncement.update({ where: { id }, data: updates });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("UPDATE ANNOUNCEMENT ERROR:", error); return { success: false, error: String(error) }; }
}

export async function deleteAnnouncement(id: string) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingAnnouncement.delete({ where: { id } });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("DELETE ANNOUNCEMENT ERROR:", error); return { success: false, error: String(error) }; }
}

// --- FAQ ---

export async function createFAQ(data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingFAQ.create({ data });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("CREATE FAQ ERROR:", error); return { success: false, error: String(error) }; }
}

export async function updateFAQ(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    const { id: _, createdAt, updatedAt, ...updates } = data;
    await prisma.landingFAQ.update({ where: { id }, data: updates });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("UPDATE FAQ ERROR:", error); return { success: false, error: String(error) }; }
}

export async function deleteFAQ(id: string) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingFAQ.delete({ where: { id } });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("DELETE FAQ ERROR:", error); return { success: false, error: String(error) }; }
}

// --- HOW IT WORKS ---

export async function createHowItWorks(data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingHowItWorks.create({ data });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("CREATE HOWITWORKS ERROR:", error); return { success: false, error: String(error) }; }
}

export async function updateHowItWorks(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    const { id: _, createdAt, updatedAt, ...updates } = data;
    await prisma.landingHowItWorks.update({ where: { id }, data: updates });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("UPDATE HOWITWORKS ERROR:", error); return { success: false, error: String(error) }; }
}

export async function deleteHowItWorks(id: string) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    await prisma.landingHowItWorks.delete({ where: { id } });
    revalidatePath("/welcome");
    return { success: true };
  } catch (error) { console.error("DELETE HOWITWORKS ERROR:", error); return { success: false, error: String(error) }; }
}

