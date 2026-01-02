import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface StudentImportRow {
  nis: string;
  nisn: string;
  name: string;
  email: string;
  gender: "MALE" | "FEMALE";
  birthDate: string;
  address: string;
  parentPhone: string;
  classId: string;
}

// POST /api/students/bulk-import
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { students } = body as { students: StudentImportRow[] };

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "No students data provided" }, { status: 400 });
    }

    const results = {
      success: [] as string[],
      errors: [] as { row: number; nis: string; error: string }[],
    };

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        if (!student.nis || !student.name || !student.email || !student.classId) {
          results.errors.push({
            row: rowNumber,
            nis: student.nis || "N/A",
            error: "Missing required fields (nis, name, email, classId)",
          });
          continue;
        }

        // Check if NIS already exists
        const existingStudent = await prisma.student.findUnique({
          where: { nis: student.nis },
        });

        if (existingStudent) {
          results.errors.push({
            row: rowNumber,
            nis: student.nis,
            error: "NIS already exists",
          });
          continue;
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: student.email },
        });

        if (existingUser) {
          results.errors.push({
            row: rowNumber,
            nis: student.nis,
            error: "Email already exists",
          });
          continue;
        }

        // Check if class exists
        const classExists = await prisma.class.findUnique({
          where: { id: student.classId },
        });

        if (!classExists) {
          results.errors.push({
            row: rowNumber,
            nis: student.nis,
            error: "Class not found",
          });
          continue;
        }

        // Create user account
        const hashedPassword = await bcrypt.hash(student.nis, 10); // Default password = NIS
        const user = await prisma.user.create({
          data: {
            email: student.email,
            password: hashedPassword,
            name: student.name,
            role: "STUDENT",
          },
        });

        // Create student record
        await prisma.student.create({
          data: {
            userId: user.id,
            nis: student.nis,
            nisn: student.nisn || "",
            classId: student.classId,
            gender: student.gender || "MALE",
            birthDate: student.birthDate ? new Date(student.birthDate) : new Date(),
            parentPhone: student.parentPhone || "",
            status: "ACTIVE",
          },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: "CREATE",
            module: "STUDENT",
            recordId: user.id,
            newData: { nis: student.nis, name: student.name, email: student.email },
          },
        });

        results.success.push(student.nis);
      } catch (error) {
        console.error(`Error importing student ${student.nis}:`, error);
        results.errors.push({
          row: rowNumber,
          nis: student.nis,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.success.length} students successfully`,
      data: {
        successCount: results.success.length,
        errorCount: results.errors.length,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error("Error in bulk import:", error);
    return NextResponse.json({ error: "Failed to import students" }, { status: 500 });
  }
}
