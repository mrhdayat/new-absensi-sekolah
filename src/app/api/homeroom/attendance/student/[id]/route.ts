import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/homeroom/attendance/student/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "HOMEROOM_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify student belongs to this homeroom teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        homeroomClasses: {
          include: {
            students: {
              where: { id },
              select: { id: true }
            }
          }
        }
      }
    });

    const isMyStudent = teacher?.homeroomClasses.some(c => c.students.length > 0);
    if (!isMyStudent) {
      return NextResponse.json({ error: "Student not found in your class" }, { status: 404 });
    }

    // Fetch Student & Attendance
    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        nis: true,
        user: { select: { name: true, email: true, avatar: true } },
        class: { select: { name: true } },
      }
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Fetch All Attendance History
    const attendanceHistory = await prisma.studentAttendance.findMany({
      where: { studentId: id },
      orderBy: { date: 'desc' },
      include: {
        schedule: {
          select: {
            subject: { select: { name: true } },
            startTime: true,
            endTime: true,
          }
        }
      }
    });

    // Calculate Stats
    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const sick = attendanceHistory.filter(a => a.status === 'SICK').length;
    const permission = attendanceHistory.filter(a => a.status === 'PERMITTED').length;
    const alpha = attendanceHistory.filter(a => a.status === 'ABSENT').length;
    const late = attendanceHistory.filter(a => a.status === 'LATE').length;

    const percentage = total > 0 ? (present / total) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.user.name,
          nis: student.nis,
          className: student.class?.name || "-",
          avatar: student.user.avatar,
        },
        stats: {
          total,
          present,
          sick,
          permission,
          alpha,
          late,
          percentage: Math.round(percentage * 10) / 10,
        },
        history: attendanceHistory.map(record => ({
          id: record.id,
          date: record.date,
          status: record.status,
          notes: record.notes,
          subject: record.schedule?.subject.name || "N/A",
          time: record.schedule ?
            `${new Date(record.schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(record.schedule.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
            : "-",
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
