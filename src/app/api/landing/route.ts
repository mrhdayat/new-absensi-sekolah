import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/landing - Get landing page settings (public)
export async function GET() {
  try {
    let settings = await prisma.landingPageSettings.findFirst();

    // Create default settings if not exist
    if (!settings) {
      settings = await prisma.landingPageSettings.create({
        data: {},
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching landing settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing settings" },
      { status: 500 }
    );
  }
}

// PUT /api/landing - Update landing page settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      heroTitle,
      heroSubtitle,
      heroImage,
      aboutTitle,
      aboutDescription,
      feature1Title,
      feature1Desc,
      feature1Icon,
      feature2Title,
      feature2Desc,
      feature2Icon,
      feature3Title,
      feature3Desc,
      feature3Icon,
      contactEmail,
      contactPhone,
      contactAddress,
      footerText,
      primaryColor,
    } = body;

    // Get or create settings
    let settings = await prisma.landingPageSettings.findFirst();

    if (!settings) {
      settings = await prisma.landingPageSettings.create({
        data: {
          heroTitle,
          heroSubtitle,
          heroImage,
          aboutTitle,
          aboutDescription,
          feature1Title,
          feature1Desc,
          feature1Icon,
          feature2Title,
          feature2Desc,
          feature2Icon,
          feature3Title,
          feature3Desc,
          feature3Icon,
          contactEmail,
          contactPhone,
          contactAddress,
          footerText,
          primaryColor,
        },
      });
    } else {
      settings = await prisma.landingPageSettings.update({
        where: { id: settings.id },
        data: {
          heroTitle,
          heroSubtitle,
          heroImage,
          aboutTitle,
          aboutDescription,
          feature1Title,
          feature1Desc,
          feature1Icon,
          feature2Title,
          feature2Desc,
          feature2Icon,
          feature3Title,
          feature3Desc,
          feature3Icon,
          contactEmail,
          contactPhone,
          contactAddress,
          footerText,
          primaryColor,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        module: "LANDING_PAGE",
        recordId: settings.id,
        newData: body,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Landing page settings updated",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating landing settings:", error);
    return NextResponse.json(
      { error: "Failed to update landing settings" },
      { status: 500 }
    );
  }
}
