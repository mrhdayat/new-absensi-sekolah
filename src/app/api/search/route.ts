import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/search - Global search across entities
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const searchTerm = query.toLowerCase();
    const results: any[] = [];

    // Search Students
    if (["SUPER_ADMIN", "ADMIN", "HOMEROOM_TEACHER", "TEACHER"].includes(session.user.role)) {
      const students = await prisma.student.findMany({
        where: {
          OR: [
            { nis: { contains: searchTerm, mode: "insensitive" } },
            { user: { name: { contains: searchTerm, mode: "insensitive" } } },
          ],
        },
        include: {
          user: { select: { name: true } },
          class: { select: { name: true } },
        },
        take: 5,
      });

      results.push(
        ...students.map((s) => ({
          id: s.id,
          type: "student",
          title: s.user.name,
          subtitle: `NIS: ${s.nis} - ${s.class?.name || "No Class"}`,
          url: `/admin/students/${s.id}`,
        }))
      );
    }

    // Search Teachers
    if (["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      const teachers = await prisma.teacher.findMany({
        where: {
          OR: [
            { nip: { contains: searchTerm, mode: "insensitive" } },
            { user: { name: { contains: searchTerm, mode: "insensitive" } } },
          ],
        },
        include: {
          user: { select: { name: true } },
        },
        take: 5,
      });

      results.push(
        ...teachers.map((t) => ({
          id: t.id,
          type: "teacher",
          title: t.user.name,
          subtitle: `NIP: ${t.nip}`,
          url: `/admin/teachers/${t.id}`,
        }))
      );
    }

    // Search Classes
    if (["SUPER_ADMIN", "ADMIN", "TEACHER", "HOMEROOM_TEACHER"].includes(session.user.role)) {
      const classes = await prisma.class.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        include: {
          homeroomTeacher: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        take: 5,
      });

      results.push(
        ...classes.map((c) => ({
          id: c.id,
          type: "class",
          title: c.name,
          subtitle: `Wali Kelas: ${c.homeroomTeacher?.user.name || "Belum ada"}`,
          url: `/admin/classes/${c.id}`,
        }))
      );
    }

    // Search Subjects
    if (["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      const subjects = await prisma.subject.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { code: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
      });

      results.push(
        ...subjects.map((s) => ({
          id: s.id,
          type: "subject",
          title: s.name,
          subtitle: `Kode: ${s.code}`,
          url: `/admin/subjects`,
        }))
      );
    }

    // Search Schedules
    if (["SUPER_ADMIN", "ADMIN", "TEACHER", "HOMEROOM_TEACHER"].includes(session.user.role)) {
      const schedules = await prisma.schedule.findMany({
        where: {
          OR: [
            { class: { name: { contains: searchTerm, mode: "insensitive" } } },
            { subject: { name: { contains: searchTerm, mode: "insensitive" } } },
          ],
        },
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } },
        },
        take: 5,
      });

      results.push(
        ...schedules.map((s) => ({
          id: s.id,
          type: "schedule",
          title: `${s.class.name} - ${s.subject.name}`,
          subtitle: `${s.dayOfWeek}, ${s.startTime} - ${s.endTime}`,
          url: `/admin/schedules`,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      data: results.slice(0, 10), // Limit to 10 results
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
