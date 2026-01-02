import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, Gender, DayOfWeek, TeacherStatus, StudentStatus, AttendanceStatus, LeaveStatus, LeaveType } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Create Prisma client with adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to generate random date in last N days
function randomDateInLast(days: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const random = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  random.setHours(0, 0, 0, 0);
  return random;
}

// Helper to generate time
function createTime(hours: number, minutes: number): Date {
  const date = new Date("1970-01-01");
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.studentAttendance.deleteMany();
  await prisma.teacherAttendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.schoolSettings.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Create Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2025/2026",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2026-06-30"),
      isActive: true,
    },
  });
  console.log("✅ Created Academic Year:", academicYear.name);

  // Create School Settings
  await prisma.schoolSettings.create({
    data: {
      schoolName: "SMKS Muhammadiyah Satui",
      address: "Jl. Pendidikan No. 1, Satui, Tanah Bumbu",
      phone: "0511-1234567",
      email: "info@smksmuhsatui.sch.id",
      attendanceStartTime: createTime(6, 30),
      attendanceEndTime: createTime(8, 0),
      gracePeriodMinutes: 15,
      lateThresholdMinutes: 30,
      enableLocationTracking: true,
    },
  });
  console.log("✅ Created School Settings");

  const hashedPassword = await bcrypt.hash("admin123", 12);

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@attendly.id",
      password: hashedPassword,
      name: "Super Administrator",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log("✅ Created Super Admin");

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@attendly.id",
      password: hashedPassword,
      name: "Administrator Sekolah",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log("✅ Created Admin");

  // Create Principal
  const principalUser = await prisma.user.create({
    data: {
      email: "kepala@attendly.id",
      password: hashedPassword,
      name: "Drs. H. Ahmad Yani, M.Pd",
      role: UserRole.PRINCIPAL,
      isActive: true,
    },
  });
  console.log("✅ Created Principal");

  // Create 15 Teachers (5 will be homeroom teachers)
  const teacherNames = [
    { name: "Ahmad Fauzi, S.Pd", nip: "198501012010011001", phone: "081234567890" },
    { name: "Siti Nurhaliza, S.Pd", nip: "198702032011012002", phone: "081234567891" },
    { name: "Budi Santoso, S.Kom", nip: "199003042012011003", phone: "081234567892" },
    { name: "Dewi Lestari, S.Pd", nip: "198805052013012004", phone: "081234567893" },
    { name: "Eko Prasetyo, S.Pd", nip: "199104062014011005", phone: "081234567894" },
    { name: "Fitri Handayani, S.Pd", nip: "198906072015012006", phone: "081234567895" },
    { name: "Gunawan Wijaya, S.Kom", nip: "199207082016011007", phone: "081234567896" },
    { name: "Hesti Rahmawati, S.Pd", nip: "198808092017012008", phone: "081234567897" },
    { name: "Irfan Hakim, S.Pd", nip: "199309102018011009", phone: "081234567898" },
    { name: "Joko Susilo, S.Pd", nip: "198710112019011010", phone: "081234567899" },
    { name: "Kartika Sari, S.Pd", nip: "199011122020012011", phone: "081234567800" },
    { name: "Lukman Hakim, S.Kom", nip: "198912132021011012", phone: "081234567801" },
    { name: "Maya Sari, S.Pd", nip: "199213142022012013", phone: "081234567802" },
    { name: "Nurul Hidayah, S.Pd", nip: "198814152023012014", phone: "081234567803" },
    { name: "Oscar Pratama, S.Pd", nip: "199315162024011015", phone: "081234567804" },
  ];

  const teachers: any[] = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const isHomeroom = i < 5; // First 5 are homeroom teachers
    const teacherUser = await prisma.user.create({
      data: {
        email: `guru${i + 1}@attendly.id`,
        password: hashedPassword,
        name: teacherNames[i].name,
        role: isHomeroom ? UserRole.HOMEROOM_TEACHER : UserRole.TEACHER,
        isActive: true,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
        nip: teacherNames[i].nip,
        phone: teacherNames[i].phone,
        status: TeacherStatus.ACTIVE,
      },
    });

    teachers.push(teacher);
  }
  console.log(`✅ Created ${teachers.length} teachers (5 homeroom)`);

  // Create Subjects
  const subjectData = [
    { code: "MAT", name: "Matematika" },
    { code: "BIN", name: "Bahasa Indonesia" },
    { code: "BIG", name: "Bahasa Inggris" },
    { code: "FIS", name: "Fisika" },
    { code: "KIM", name: "Kimia" },
    { code: "BIO", name: "Biologi" },
    { code: "SEJ", name: "Sejarah" },
    { code: "GEO", name: "Geografi" },
    { code: "TKJ", name: "Teknik Komputer Jaringan" },
    { code: "RPL", name: "Rekayasa Perangkat Lunak" },
    { code: "MM", name: "Multimedia" },
    { code: "PKN", name: "Pendidikan Kewarganegaraan" },
  ];

  const subjects = await Promise.all(
    subjectData.map((s) =>
      prisma.subject.create({
        data: { code: s.code, name: s.name, description: `Mata pelajaran ${s.name}` },
      })
    )
  );
  console.log(`✅ Created ${subjects.length} subjects`);

  // Create 10 Classes (X, XI, XII for TKJ, RPL, MM, and general)
  const classData = [
    { name: "X TKJ 1", grade: "X", homeroomIdx: 0, capacity: 40 },
    { name: "X TKJ 2", grade: "X", homeroomIdx: 1, capacity: 40 },
    { name: "X RPL 1", grade: "X", homeroomIdx: 2, capacity: 40 },
    { name: "X MM 1", grade: "X", homeroomIdx: 3, capacity: 40 },
    { name: "XI TKJ 1", grade: "XI", homeroomIdx: 4, capacity: 40 },
    { name: "XI RPL 1", grade: "XI", homeroomIdx: 0, capacity: 40 },
    { name: "XI MM 1", grade: "XI", homeroomIdx: 1, capacity: 40 },
    { name: "XII TKJ 1", grade: "XII", homeroomIdx: 2, capacity: 40 },
    { name: "XII RPL 1", grade: "XII", homeroomIdx: 3, capacity: 40 },
    { name: "XII MM 1", grade: "XII", homeroomIdx: 4, capacity: 40 },
  ];

  const classes = await Promise.all(
    classData.map((c) =>
      prisma.class.create({
        data: {
          name: c.name,
          grade: c.grade,
          academicYearId: academicYear.id,
          homeroomTeacherId: teachers[c.homeroomIdx].id,
          capacity: c.capacity,
        },
      })
    )
  );
  console.log(`✅ Created ${classes.length} classes`);

  // Create 60+ Students distributed across classes
  const firstNames = [
    "Muhammad", "Ahmad", "Budi", "Andi", "Dimas", "Eko", "Fajar", "Galih", "Hadi", "Irfan",
    "Siti", "Dewi", "Fitri", "Hesti", "Indah", "Kartika", "Lina", "Maya", "Nurul", "Putri",
    "Rina", "Sari", "Tari", "Uci", "Vina", "Wati", "Yuni", "Zahra", "Ayu", "Bella",
  ];
  const lastNames = [
    "Pratama", "Saputra", "Wijaya", "Santoso", "Hidayat", "Rahmawati", "Lestari", "Handayani",
    "Wulandari", "Kusuma", "Permata", "Cahaya", "Sari", "Purnama", "Utami", "Anggraini",
  ];

  let nisCounter = 2024001;
  const students = [];

  for (const cls of classes) {
    const studentsPerClass = cls.capacity - 2; // Leave some capacity
    for (let i = 0; i < studentsPerClass; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const gender = ["Muhammad", "Ahmad", "Budi", "Andi", "Dimas", "Eko", "Fajar", "Galih", "Hadi", "Irfan"].includes(firstName)
        ? Gender.MALE
        : Gender.FEMALE;

      const studentUser = await prisma.user.create({
        data: {
          email: `${nisCounter}@siswa.attendly.id`,
          password: hashedPassword,
          name: fullName,
          role: UserRole.STUDENT,
          isActive: true,
        },
      });

      const student = await prisma.student.create({
        data: {
          userId: studentUser.id,
          nis: String(nisCounter),
          nisn: String(3000000000 + nisCounter),
          gender,
          classId: cls.id,
          parentPhone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
          birthDate: new Date(2007 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)),
          status: StudentStatus.ACTIVE,
        },
      });

      students.push(student);
      nisCounter++;
    }
  }
  console.log(`✅ Created ${students.length} students`);

  // Create Schedules (Mon-Fri, 8 periods per day)
  const days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];
  const periods = [
    { start: createTime(7, 30), end: createTime(8, 30) },
    { start: createTime(8, 30), end: createTime(9, 30) },
    { start: createTime(9, 45), end: createTime(10, 45) },
    { start: createTime(10, 45), end: createTime(11, 45) },
    { start: createTime(12, 30), end: createTime(13, 30) },
    { start: createTime(13, 30), end: createTime(14, 30) },
    { start: createTime(14, 45), end: createTime(15, 45) },
  ];

  let scheduleCount = 0;
  for (const cls of classes) {
    for (const day of days) {
      for (let p = 0; p < Math.min(6, periods.length); p++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];

        await prisma.schedule.create({
          data: {
            classId: cls.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            dayOfWeek: day,
            startTime: periods[p].start,
            endTime: periods[p].end,
            room: `Ruang ${Math.floor(101 + Math.random() * 50)}`,
          },
        });
        scheduleCount++;
      }
    }
  }
  console.log(`✅ Created ${scheduleCount} schedule entries`);

  // Create historical attendance data (last 30 days)
  console.log("📊 Creating historical attendance data...");

  const schedules = await prisma.schedule.findMany({
    include: { class: { include: { students: true } } },
  });

  let attendanceCount = 0;
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dayName = Object.values(DayOfWeek)[dayOfWeek - 1];

    const todaySchedules = schedules.filter((s) => s.dayOfWeek === dayName);

    for (const schedule of todaySchedules) {
      for (const student of schedule.class.students) {
        const rand = Math.random();
        let status: AttendanceStatus;

        if (rand < 0.85) status = AttendanceStatus.PRESENT;
        else if (rand < 0.92) status = AttendanceStatus.LATE;
        else if (rand < 0.96) status = AttendanceStatus.SICK;
        else if (rand < 0.98) status = AttendanceStatus.PERMITTED;
        else status = AttendanceStatus.ABSENT;

        await prisma.studentAttendance.create({
          data: {
            studentId: student.id,
            scheduleId: schedule.id,
            date,
            status,
            recordedById: teachers[0].userId,
          },
        });
        attendanceCount++;
      }
    }
  }
  console.log(`✅ Created ${attendanceCount} student attendance records`);

  // Create teacher attendance (last 30 days)
  let teacherAttendanceCount = 0;
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const teacher of teachers) {
      const rand = Math.random();
      let status: AttendanceStatus;

      if (rand < 0.95) status = AttendanceStatus.PRESENT;
      else if (rand < 0.98) status = AttendanceStatus.LATE;
      else status = AttendanceStatus.SICK;

      const checkInTime = new Date(date);
      checkInTime.setHours(7, Math.floor(Math.random() * 30), 0, 0);

      const checkOutTime = new Date(date);
      checkOutTime.setHours(15, Math.floor(Math.random() * 60), 0, 0);

      await prisma.teacherAttendance.create({
        data: {
          teacherId: teacher.id,
          date,
          checkIn: checkInTime,
          checkOut: status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE ? checkOutTime : null,
          status,
        },
      });
      teacherAttendanceCount++;
    }
  }
  console.log(`✅ Created ${teacherAttendanceCount} teacher attendance records`);

  // Create some leave requests
  const leaveCount = 20;
  for (let i = 0; i < leaveCount; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const startDate = randomDateInLast(20);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(1 + Math.random() * 3));

    const statuses = [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        type: Math.random() > 0.5 ? LeaveType.SICK : LeaveType.FAMILY,
        startDate,
        endDate,
        reason: "Sakit demam" + (Math.random() > 0.7 ? " dan batuk" : ""),
        status,
        approvedById: status !== LeaveStatus.PENDING ? principalUser.id : undefined,
      },
    });
  }
  console.log(`✅ Created ${leaveCount} leave requests`);

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "CREATE",
      module: "SYSTEM",
      recordId: "seed",
      newData: { message: "Database seeded with comprehensive dummy data" },
    },
  });

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${teachers.length} Teachers (5 Homeroom)`);
  console.log(`   - ${students.length} Students`);
  console.log(`   - ${classes.length} Classes`);
  console.log(`   - ${subjects.length} Subjects`);
  console.log(`   - ${scheduleCount} Schedule Entries`);
  console.log(`   - ${attendanceCount} Student Attendance Records`);
  console.log(`   - ${teacherAttendanceCount} Teacher Attendance Records`);
  console.log(`   - ${leaveCount} Leave Requests`);

  console.log("\n📝 Login credentials:");
  console.log("   Super Admin: superadmin@attendly.id / admin123");
  console.log("   Admin: admin@attendly.id / admin123");
  console.log("   Principal: kepala@attendly.id / admin123");
  console.log("   Homeroom Teacher: guru1@attendly.id / admin123");
  console.log("   Teacher: guru6@attendly.id / admin123");
  console.log("   Student: 2024001@siswa.attendly.id / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
