import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function verifyData() {
  console.log('🔍 Verifying homeroom teacher assignments...\n');

  // Get all classes with their homeroom teachers and students
  const classes = await prisma.class.findMany({
    include: {
      homeroomTeacher: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      students: {
        select: {
          id: true,
          nis: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`Found ${classes.length} classes\n`);

  for (const classData of classes) {
    const studentCount = classData.students.length;
    const homeroomTeacher = classData.homeroomTeacher;

    console.log(`📚 ${classData.name}`);
    console.log(`   Wali Kelas: ${homeroomTeacher?.user.name || 'NONE'} (${homeroomTeacher?.user.email || 'N/A'})`);
    console.log(`   Siswa: ${studentCount} students`);

    if (studentCount === 0) {
      console.log(`   ⚠️  WARNING: No students assigned!`);
    }

    console.log('');
  }

  // Summary
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.teacher.count();

  console.log('\n📊 Summary:');
  console.log(`   Total Classes: ${classes.length}`);
  console.log(`   Total Students: ${totalStudents}`);
  console.log(`   Total Teachers: ${totalTeachers}`);

  await prisma.$disconnect();
}

verifyData();
