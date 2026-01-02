import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bulkScheduleImportSchema } from "@/lib/validations";
import { DayOfWeek } from "@/generated/prisma";

// POST /api/schedules/bulk-import - Bulk import schedules from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin/super admin can bulk import
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = bulkScheduleImportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { schedules } = validation.data;

    // Helper function to parse time string to Date
    const parseTime = (timeStr: string): Date => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date("1970-01-01");
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    // Helper function to check time overlap
    const hasTimeOverlap = (
      start1: Date,
      end1: Date,
      start2: Date,
      end2: Date
    ): boolean => {
      return start1 < end2 && start2 < end1;
    };

    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as Array<{ row: number; className: string; error: string }>,
    };

    // Process each schedule
    for (let i = 0; i < schedules.length; i++) {
      const row = schedules[i];
      const rowNumber = i + 1;

      try {
        // Find class by name
        const classData = await prisma.class.findFirst({
          where: { name: row.className },
        });

        if (!classData) {
          results.errors.push({
            row: rowNumber,
            className: row.className,
            error: `Kelas "${row.className}" tidak ditemukan`,
          });
          results.errorCount++;
          continue;
        }

        // Find subject by code
        const subject = await prisma.subject.findUnique({
          where: { code: row.subjectCode },
        });

        if (!subject) {
          results.errors.push({
            row: rowNumber,
            className: row.className,
            error: `Mata pelajaran dengan kode "${row.subjectCode}" tidak ditemukan`,
          });
          results.errorCount++;
          continue;
        }

        // Find teacher by NIP
        const teacher = await prisma.teacher.findUnique({
          where: { nip: row.teacherNIP },
        });

        if (!teacher) {
          results.errors.push({
            row: rowNumber,
            className: row.className,
            error: `Guru dengan NIP "${row.teacherNIP}" tidak ditemukan`,
          });
          results.errorCount++;
          continue;
        }

        // Parse times
        const startTime = parseTime(row.startTime);
        const endTime = parseTime(row.endTime);

        // Validate end time is after start time
        if (endTime <= startTime) {
          results.errors.push({
            row: rowNumber,
            className: row.className,
            error: "Waktu selesai harus lebih besar dari waktu mulai",
          });
          results.errorCount++;
          continue;
        }

        // Check for time conflicts (same class, same day, overlapping time)
        const existingSchedules = await prisma.schedule.findMany({
          where: {
            classId: classData.id,
            dayOfWeek: row.dayOfWeek as DayOfWeek,
          },
        });

        let hasConflict = false;
        for (const existing of existingSchedules) {
          if (
            hasTimeOverlap(
              startTime,
              endTime,
              existing.startTime,
              existing.endTime
            )
          ) {
            results.errors.push({
              row: rowNumber,
              className: row.className,
              error: `Konflik waktu dengan jadwal yang sudah ada (${row.dayOfWeek} ${existing.startTime.toTimeString().slice(0, 5)}-${existing.endTime.toTimeString().slice(0, 5)})`,
            });
            results.errorCount++;
            hasConflict = true;
            break;
          }
        }

        if (hasConflict) continue;

        // Create schedule
        await prisma.schedule.create({
          data: {
            classId: classData.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            dayOfWeek: row.dayOfWeek as DayOfWeek,
            startTime,
            endTime,
            room: row.room,
          },
        });

        results.successCount++;
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.errors.push({
          row: rowNumber,
          className: row.className,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        results.errorCount++;
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "BULK_IMPORT",
        module: "SCHEDULE",
        recordId: "bulk-import",
        newData: {
          totalRows: schedules.length,
          successCount: results.successCount,
          errorCount: results.errorCount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error in bulk schedule import:", error);
    return NextResponse.json(
      { error: "Failed to import schedules" },
      { status: 500 }
    );
  }
}
