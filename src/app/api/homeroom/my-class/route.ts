import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/homeroom/my-class - Get homeroom teacher's class info
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOMEROOM_TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        homeroomClasses: {
          include: {
            academicYear: true,
            students: {
              where: { status: "ACTIVE" },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
                attendances: {
                  where: {
                    date: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
                leaveRequests: {
                  where: {
                    status: "PENDING",
                  },
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
              orderBy: {
                nis: "asc",
              },
            },
            schedules: {
              include: {
                subject: true,
                teacher: {
                  include: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacher || teacher.homeroomClasses.length === 0) {
      return NextResponse.json(
        { error: "No homeroom class assigned" },
        { status: 404 }
      );
    }

    const homeroomClass = teacher.homeroomClasses[0];

    // Calculate attendance stats for each student
    const studentsWithStats = homeroomClass.students.map((student) => {
      const attendances = student.attendances;
      const totalDays = attendances.length;

      const present = attendances.filter(a => a.status === "PRESENT").length;
      const late = attendances.filter(a => a.status === "LATE").length;
      const sick = attendances.filter(a => a.status === "SICK").length;
      const permission = attendances.filter(a => a.status === "PERMITTED").length;
      const alpha = attendances.filter(a => a.status === "ABSENT").length;

      // Effective present includes LATE
      const totalPresent = present + late;
      const percentage = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;

      // Get last attendance (today/yesterday)
      const lastAtt = attendances.length > 0 ? attendances[0] : null;

      return {
        id: student.id,
        name: student.user.name,
        nis: student.nis,
        attendance: {
          present: totalPresent,
          sick,
          permission,
          alpha,
          total: totalDays,
          percentage: Math.round(percentage * 10) / 10,
        },
        lastAttendance: lastAtt ? {
          status: lastAtt.status === "PRESENT" || lastAtt.status === "LATE" ? "HADIR" :
            lastAtt.status === "SICK" ? "SAKIT" :
              lastAtt.status === "PERMITTED" ? "IZIN" : "ALPA",
          date: lastAtt.date,
          time: lastAtt.createdAt ? new Date(lastAtt.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
        } : undefined,
      };
    });

    // Calculate Class Average
    const averageAttendance = studentsWithStats.length > 0
      ? Math.round(
        (studentsWithStats.reduce((sum, s) => sum + s.attendance.percentage, 0) /
          studentsWithStats.length) *
        10
      ) / 10
      : 0;

    // Filter Low Attendance
    const lowAttendanceStudents = studentsWithStats.filter(
      (s) => s.attendance.percentage < 80
    );

    return NextResponse.json({
      success: true,
      data: {
        id: homeroomClass.id,
        name: homeroomClass.name,
        grade: homeroomClass.grade,
        major: "", // Schema doesn't have major yet
        academicYear: homeroomClass.academicYear.name,
        totalStudents: studentsWithStats.length,
        averageAttendance,
        students: studentsWithStats,
        lowAttendanceStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching homeroom class:", error);
    return NextResponse.json(
      { error: "Failed to fetch homeroom class data" },
      { status: 500 }
    );
  }
}
