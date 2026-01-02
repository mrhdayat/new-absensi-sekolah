import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function checkTeacherData() {
  console.log('🔍 Checking Ahmad Fauzi (guru3@attendly.id)...\n');

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: 'guru3@attendly.id' },
    include: {
      teacher: {
        include: {
          homeroomClasses: {
            include: {
              students: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log('❌ User not found!');
    return;
  }

  console.log(`✅ User found: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Has teacher record: ${user.teacher ? 'YES' : 'NO'}`);

  if (user.teacher) {
    console.log(`   Teacher ID: ${user.teacher.id}`);
    console.log(`   Homeroom classes: ${user.teacher.homeroomClasses.length}`);

    if (user.teacher.homeroomClasses.length > 0) {
      user.teacher.homeroomClasses.forEach((cls) => {
        console.log(`   - ${cls.name}: ${cls.students.length} students`);
      });
    }
  }

  // Check all homeroom teachers
  console.log('\n📋 All Homeroom Teachers:');
  const allTeachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
          role: true,
        },
      },
      homeroomClasses: {
        include: {
          students: true,
        },
      },
    },
  });

  allTeachers.forEach((teacher) => {
    const homeroomCount = teacher.homeroomClasses.length;
    const studentCount = teacher.homeroomClasses.reduce((sum, cls) => sum + cls.students.length, 0);
    console.log(`${teacher.user.name} (${teacher.user.email})`);
    console.log(`  Role: ${teacher.user.role}`);
    console.log(`  Homeroom classes: ${homeroomCount}`);
    console.log(`  Total students: ${studentCount}\n`);
  });

  await prisma.$disconnect();
}

checkTeacherData();
