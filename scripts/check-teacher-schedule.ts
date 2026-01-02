import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function checkTeacherSchedule() {
  console.log('🔍 Checking Ahmad Fauzi schedule...\n');

  // Get Ahmad Fauzi's user and teacher record
  const user = await prisma.user.findUnique({
    where: { email: 'guru3@attendly.id' },
    include: {
      teacher: true,
    },
  });

  if (!user || !user.teacher) {
    console.log('❌ Teacher not found');
    return;
  }

  console.log(`✅ Teacher: ${user.name}`);
  console.log(`   Email: ${user.email}\n`);

  // Get all schedules for this teacher
  const schedules = await prisma.schedule.findMany({
    where: {
      teacherId: user.teacher.id,
    },
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true, code: true } },
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ],
  });

  console.log(`📅 Total teaching hours: ${schedules.length}\n`);

  // Group by day
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  for (const day of days) {
    const daySchedules = schedules.filter(s => s.dayOfWeek === day);

    if (daySchedules.length === 0) continue;

    console.log(`\n📆 ${day} (${daySchedules.length} periods):`);

    // Check for conflicts
    const timeSlots = new Map<string, any[]>();

    for (const schedule of daySchedules) {
      const timeKey = schedule.startTime.toTimeString().substring(0, 5);

      if (!timeSlots.has(timeKey)) {
        timeSlots.set(timeKey, []);
      }

      timeSlots.get(timeKey)!.push(schedule);
    }

    // Display and check conflicts
    for (const [time, slots] of timeSlots.entries()) {
      if (slots.length > 1) {
        console.log(`   ❌ ${time} - CONFLICT! Teaching ${slots.length} classes:`);
        slots.forEach(s => {
          console.log(`      - ${s.subject.name} (${s.class.name})`);
        });
      } else {
        const s = slots[0];
        console.log(`   ✅ ${time} - ${s.subject.name} (${s.class.name})`);
      }
    }
  }

  console.log('\n');
  await prisma.$disconnect();
}

checkTeacherSchedule().catch(console.error);
