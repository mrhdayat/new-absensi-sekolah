import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function listTeachers() {
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  console.log('Teacher Order (sorted by name):');
  teachers.forEach((t, i) => {
    console.log(`${i}: ${t.user.email} - ${t.user.name}`);
  });

  await prisma.$disconnect();
}

listTeachers();
