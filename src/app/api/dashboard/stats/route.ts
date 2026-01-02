import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@/generated/prisma";

// GET /api/dashboard/stats - Get role-specific dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Common stats for all roles
    const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.teacher.count({ where: { status: "ACTIVE" } }),
      prisma.class.count(),
    ]);

    // Today's attendance stats
    const [todayStudentAttendance, todayTeacherAttendance] = await Promise.all([
      prisma.studentAttendance.groupBy({
        by: ["status"],
        where: { date: today },
        _count: true,
      }),
      prisma.teacherAttendance.groupBy({
        by: ["status"],
        where: { date: today },
        _count: true,
      }),
    ]);

    const studentAttendanceMap: Record<string, number> = {
      PRESENT: 0,
      LATE: 0,
      SICK: 0,
      PERMITTED: 0,
      ABSENT: 0,
    };

    todayStudentAttendance.forEach((item) => {
      studentAttendanceMap[item.status] = item._count;
    });

    const totalPresent = studentAttendanceMap.PRESENT + studentAttendanceMap.LATE;
    const totalRecorded = Object.values(studentAttendanceMap).reduce((a, b) => a + b, 0);
    const attendanceRate = totalRecorded > 0 ? ((totalPresent / totalRecorded) * 100).toFixed(1) : "0.0";

    // Role-specific data
    let roleSpecificData = {};

    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      const [pendingLeaves, recentActivities] = await Promise.all([
        prisma.leaveRequest.count({ where: { status: "PENDING" } }),
        prisma.auditLog.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { name: true },
            },
          },
        }),
      ]);

      roleSpecificData = {
        pendingLeaves,
        recentActivities: recentActivities.map((log) => ({
          id: log.id,
          user: log.user?.name || "System",
          action: log.action,
          module: log.module,
          createdAt: log.createdAt,
        })),
      };
    }

    if (role === "HOMEROOM_TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          homeroomClasses: {
            include: {
              students: {
                where: { status: "ACTIVE" },
                include: {
                  attendances: {
                    where: {
                      date: {
                        gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (teacher && teacher.homeroomClasses.length > 0) {
        const homeroomClass = teacher.homeroomClasses[0];
        const studentsWithLowAttendance = homeroomClass.students.filter((student) => {
          const totalDays = student.attendances.length;
          const presentDays = student.attendances.filter(
            (a) => a.status === "PRESENT" || a.status === "LATE"
          ).length;
          const rate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;
          return rate < 80;
        });

        roleSpecificData = {
          homeroomClass: {
            id: homeroomClass.id,
            name: homeroomClass.name,
            totalStudents: homeroomClass.students.length,
            lowAttendanceCount: studentsWithLowAttendance.length,
          },
        };
      }
    }

    if (role === "TEACHER" || role === "HOMEROOM_TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (teacher) {
        const myAttendanceToday = await prisma.teacherAttendance.findUnique({
          where: {
            teacherId_date: {
              teacherId: teacher.id,
              date: today,
            },
          },
        });

        const todaySchedules = await prisma.schedule.findMany({
          where: {
            teacherId: teacher.id,
            dayOfWeek: ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][
              new Date().getDay()
            ] as any,
          },
          include: {
            class: true,
            subject: true,
          },
          orderBy: { startTime: "asc" },
        });

        roleSpecificData = {
          ...roleSpecificData,
          myAttendance: myAttendanceToday
            ? {
              checkIn: myAttendanceToday.checkIn,
              checkOut: myAttendanceToday.checkOut,
              status: myAttendanceToday.status,
            }
            : null,
          todaySchedules: todaySchedules.map((s) => ({
            id: s.id,
            className: s.class.name,
            subjectName: s.subject.name,
            startTime: s.startTime,
            endTime: s.endTime,
            room: s.room,
          })),
        };
      }
    }

    if (role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
          class: true,
          attendances: {
            where: {
              date: {
                gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          leaveRequests: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (student) {
        const totalDays = student.attendances.length;
        const presentDays = student.attendances.filter(
          (a) => a.status === "PRESENT" || a.status === "LATE"
        ).length;
        const myAttendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";

        roleSpecificData = {
          myClass: student.class?.name || "-",
          myAttendanceRate,
          totalPresent: presentDays,
          totalAbsent: totalDays - presentDays,
          recentLeaves: student.leaveRequests.map((l) => ({
            id: l.id,
            type: l.type,
            startDate: l.startDate,
            endDate: l.endDate,
            status: l.status,
          })),
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalClasses,
          attendanceRate,
        },
        todayAttendance: {
          students: studentAttendanceMap,
          teachers: {
            total: todayTeacherAttendance.reduce((sum, item) => sum + item._count, 0),
            present: todayTeacherAttendance
              .filter((item) => item.status === "PRESENT" || item.status === "LATE")
              .reduce((sum, item) => sum + item._count, 0),
          },
        },
        ...roleSpecificData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
