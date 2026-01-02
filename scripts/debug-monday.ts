import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function debugMonday8am() {
  console.log('🔍 Debugging Monday 08:00 schedules...\n');

  const schedules = await prisma.schedule.findMany({
    where: {
      dayOfWeek: 'MONDAY',
    },
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      subject: { select: { name: true, code: true } },
      class: { select: { name: true } },
    },
    orderBy: [{ startTime: 'asc' }],
  });

  // Group by time
  const byTime = new Map<string, any[]>();

  for (const s of schedules) {
    const timeKey = s.startTime.toTimeString().substring(0, 5);
    if (!byTime.has(timeKey)) {
      byTime.set(timeKey, []);
    }
    byTime.get(timeKey)!.push(s);
  }

  console.log('Monday Schedule by Time:\n');

  for (const [time, slots] of Array.from(byTime.entries()).sort()) {
    console.log(`\n⏰ ${time}:`);

    // Check for teacher conflicts
    const teacherCount = new Map<string, number>();
    for (const s of slots) {
      const count = teacherCount.get(s.teacherId) || 0;
      teacherCount.set(s.teacherId, count + 1);
    }

    // Show all assignments
    for (const s of slots) {
      const conflict = (teacherCount.get(s.teacherId) || 0) > 1 ? '❌' : '✅';
      console.log(`   ${conflict} ${s.teacher.user.name} -> ${s.subject.code} (${s.class.name})`);
    }

    // Show conflicts
    for (const [teacherId, count] of teacherCount.entries()) {
      if (count > 1) {
        const teacher = slots.find(s => s.teacherId === teacherId)?.teacher.user.name;
        console.log(`   ⚠️  ${teacher}: ${count} classes!`);
      }
    }
  }

  await prisma.$disconnect();
}

debugMonday8am();
