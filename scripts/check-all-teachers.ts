import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function checkAllTeachers() {
  console.log('🔍 Checking ALL teachers schedules from DATABASE...\n');

  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  for (const teacher of teachers) {
    const schedules = await prisma.schedule.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    const subjects = new Set(schedules.map(s => s.subject.code));
    const totalHours = schedules.length;

    console.log(`\n📧 ${teacher.user.email}`);
    console.log(`👤 ${teacher.user.name}`);
    console.log(`📚 Subjects: ${Array.from(subjects).join(', ')}`);
    console.log(`⏰ Total hours: ${totalHours}`);

    if (subjects.size > 1) {
      console.log(`⚠️  WARNING: Teaching multiple subjects!`);
    }

    // Check Monday 08:00 for conflicts
    const monday8am = schedules.filter(s =>
      s.dayOfWeek === 'MONDAY' && s.startTime.getHours() === 8
    );

    if (monday8am.length > 1) {
      console.log(`❌ CONFLICT at Monday 08:00: ${monday8am.length} classes`);
      monday8am.forEach(s => {
        console.log(`   - ${s.subject.name} (${s.class.name})`);
      });
    } else if (monday8am.length === 1) {
      console.log(`✅ Monday 08:00: ${monday8am[0].subject.name} (${monday8am[0].class.name})`);
    }
  }

  await prisma.$disconnect();
}

checkAllTeachers();
