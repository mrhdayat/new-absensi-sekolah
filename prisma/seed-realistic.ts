import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🚀 Starting realistic school data seeder...\n');

  // 0. Create Admin & Principal Accounts
  console.log('🔐 Creating Admin & Principal Accounts...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@attendly.id' },
    update: {},
    create: {
      email: 'superadmin@attendly.id',
      password: hashedPassword,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@attendly.id' },
    update: {},
    create: {
      email: 'admin@attendly.id',
      password: hashedPassword,
      name: 'Administrator Sekolah',
      role: 'ADMIN',
    },
  });

  // Principal
  await prisma.user.upsert({
    where: { email: 'kepala@attendly.id' },
    update: {},
    create: {
      email: 'kepala@attendly.id',
      password: hashedPassword,
      name: 'Drs. H. Ahmad Yani, M.Pd',
      role: 'PRINCIPAL',
    },
  });
  console.log('✅ Created Super Admin, Admin, and Principal accounts\n');

  // 1. Create Academic Year
  console.log('📅 Creating Academic Year...');
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024/2025',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2025-06-30'),
      isActive: true,
    },
  });
  console.log(`✅ Academic Year created: ${academicYear.name}\n`);

  // 2. Create Subjects (12 subjects)
  console.log('📚 Creating 12 Subjects...');
  const subjectsData = [
    { code: 'MAT', name: 'Matematika' },
    { code: 'BIN', name: 'Bahasa Indonesia' },
    { code: 'BING', name: 'Bahasa Inggris' },
    { code: 'IPA', name: 'IPA' },
    { code: 'IPS', name: 'IPS' },
    { code: 'PAI', name: 'Pendidikan Agama Islam' },
    { code: 'PKN', name: 'PPKn' },
    { code: 'PJOK', name: 'PJOK' },
    { code: 'SBD', name: 'Seni Budaya' },
    { code: 'INF', name: 'Informatika' },
    { code: 'BDAE', name: 'Bahasa Daerah' },
    { code: 'PKY', name: 'Prakarya' },
  ];

  const subjects = await Promise.all(
    subjectsData.map((subject) =>
      prisma.subject.create({
        data: subject,
      })
    )
  );
  console.log(`✅ Created ${subjects.length} subjects\n`);

  // 3. Create Teachers (15 teachers)
  console.log('👨‍🏫 Creating 15 Teachers...');
  const teachersData = [
    // Homeroom Teachers (10)
    { name: 'Budi Santoso, S.Pd', email: 'guru1@attendly.id', nip: '198501012010011001', subject: 'Matematika' },
    { name: 'Siti Nurhaliza, S.Pd', email: 'guru2@attendly.id', nip: '198602022010012001', subject: 'Bahasa Indonesia' },
    { name: 'Ahmad Fauzi, S.Pd', email: 'guru3@attendly.id', nip: '198703032010013001', subject: 'Bahasa Inggris' },
    { name: 'Dewi Lestari, S.Pd', email: 'guru4@attendly.id', nip: '198804042010014001', subject: 'IPA' },
    { name: 'Eko Prasetyo, S.Pd', email: 'guru5@attendly.id', nip: '198905052010015001', subject: 'IPS' },
    { name: 'Fitri Handayani, S.Pd', email: 'guru6@attendly.id', nip: '199006062010016001', subject: 'Matematika' },
    { name: 'Hendra Wijaya, S.Pd', email: 'guru7@attendly.id', nip: '199107072010017001', subject: 'Bahasa Indonesia' },
    { name: 'Indah Permata, S.Pd', email: 'guru8@attendly.id', nip: '199208082010018001', subject: 'Bahasa Inggris' },
    { name: 'Joko Susilo, S.Pd', email: 'guru9@attendly.id', nip: '199309092010019001', subject: 'IPA' },
    { name: 'Kartika Sari, S.Pd', email: 'guru10@attendly.id', nip: '199410102010011002', subject: 'Pendidikan Agama Islam' },

    // Subject-only Teachers (5)
    { name: 'Lukman Hakim, S.Pd', email: 'guru11@attendly.id', nip: '199511112010011003', subject: 'PPKn' },
    { name: 'Maya Anggraini, S.Pd', email: 'guru12@attendly.id', nip: '199612122010012002', subject: 'PJOK' },
    { name: 'Nurul Hidayah, S.Pd', email: 'guru13@attendly.id', nip: '199701012010013002', subject: 'Seni Budaya' },
    { name: 'Oki Setiawan, S.Kom', email: 'guru14@attendly.id', nip: '199802022010014002', subject: 'Informatika' },
    { name: 'Putri Rahayu, S.Pd', email: 'guru15@attendly.id', nip: '199903032010015002', subject: 'Bahasa Daerah' },
  ];

  /* hashedPassword reused from earlier */
  const teachers: any[] = [];

  for (const teacherData of teachersData) {
    const subject = subjects.find((s) => s.name === teacherData.subject);

    const user = await prisma.user.create({
      data: {
        email: teacherData.email,
        password: hashedPassword,
        name: teacherData.name,
        role: teachersData.indexOf(teacherData) < 10 ? 'HOMEROOM_TEACHER' : 'TEACHER',
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        nip: teacherData.nip,
        status: 'ACTIVE',
      },
    });

    teachers.push({ ...teacher, user, subjectName: teacherData.subject });
  }
  console.log(`✅ Created ${teachers.length} teachers\n`);

  // 4. Create Classes (10 classes)
  console.log('🏫 Creating 10 Classes...');
  const classesData = [
    { name: 'X-A', grade: 'X', homeroomTeacherIndex: 0 },
    { name: 'X-B', grade: 'X', homeroomTeacherIndex: 1 },
    { name: 'X-C', grade: 'X', homeroomTeacherIndex: 2 },
    { name: 'XI-A', grade: 'XI', homeroomTeacherIndex: 3 },
    { name: 'XI-B', grade: 'XI', homeroomTeacherIndex: 4 },
    { name: 'XI-C', grade: 'XI', homeroomTeacherIndex: 5 },
    { name: 'XII-A', grade: 'XII', homeroomTeacherIndex: 6 },
    { name: 'XII-B', grade: 'XII', homeroomTeacherIndex: 7 },
    { name: 'XII-C', grade: 'XII', homeroomTeacherIndex: 8 },
    { name: 'XII-D', grade: 'XII', homeroomTeacherIndex: 9 },
  ];

  const classes = await Promise.all(
    classesData.map((classData) =>
      prisma.class.create({
        data: {
          name: classData.name,
          grade: classData.grade,
          capacity: 40,
          academicYearId: academicYear.id,
          homeroomTeacherId: teachers[classData.homeroomTeacherIndex].id,
        },
      })
    )
  );
  console.log(`✅ Created ${classes.length} classes\n`);

  // 4b. Create Badges
  console.log('🏆 Creating Badges...');
  const badgesData = [
    { code: 'EARLY_BIRD', name: 'Burung Pagi', description: 'Absen sebelum 06:45', icon: 'Sunrise', xpValue: 50 },
    { code: 'PERFECT_WEEK', name: 'Minggu Sempurna', description: 'Hadir penuh 1 minggu tanpa telat', icon: 'CalendarCheck', xpValue: 150 },
    { code: 'ON_FIRE', name: 'Semangat Membara', description: 'Streak kehadiran 30 hari', icon: 'Flame', xpValue: 500 },
    { code: 'SCHOLAR', name: 'Kutu Buku', description: 'Tidak pernah bolos pelajaran', icon: 'BookOpen', xpValue: 100 },
  ];

  await Promise.all(
    badgesData.map(b =>
      prisma.badge.upsert({
        where: { code: b.code },
        update: {},
        create: b
      })
    )
  );
  console.log('✅ Created Badges\n');

  // 5. Create Students (264 students)
  console.log('👨‍🎓 Creating 264 Students...');
  const studentsPerClass = [27, 27, 26, 27, 26, 27, 26, 27, 26, 27]; // Total: 264
  let studentCount = 0;

  for (let classIndex = 0; classIndex < classes.length; classIndex++) {
    const classData = classes[classIndex];
    const numStudents = studentsPerClass[classIndex];

    for (let i = 1; i <= numStudents; i++) {
      studentCount++;
      const nis = `2024${String(studentCount).padStart(3, '0')}`;
      const nisn = `0${String(studentCount).padStart(9, '0')}`;
      const studentName = `Siswa ${classData.name}-${i}`;
      const email = `${nis}@siswa.attendly.id`;

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: studentName,
          role: 'STUDENT',
        },
      });

      await prisma.student.create({
        data: {
          userId: user.id,
          nis,
          nisn,
          classId: classData.id,
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          birthDate: new Date(2008 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          parentPhone: `08${Math.floor(Math.random() * 10000000000)}`,
          status: 'ACTIVE',
        },
      });

      // Initialize Gamification Profile
      await prisma.gamificationProfile.create({
        data: {
          userId: user.id,
          xp: Math.floor(Math.random() * 500), // Random starting XP
          level: 1,
          points: 0,
        }
      });
    }
  }
  console.log(`✅ Created ${studentCount} students across ${classes.length} classes\n`);
  // Schedule generation has been moved to scripts/generate-zero-conflict-schedule.ts
  // to ensure no conflicts occur.
  console.log('📅 Skipping static schedule generation (Run npm run generate-schedule instead)...\n');

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Academic Year: 1`);
  console.log(`   - Subjects: ${subjects.length}`);
  console.log(`   - Teachers: ${teachers.length}`);
  console.log(`   - Classes: ${classes.length}`);
  console.log(`   - Students: ${studentCount}`);

}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
