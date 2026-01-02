import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function properVerification() {
  console.log('🔍 PROPER Verification of ALL Teachers...\n');

  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  let totalConflicts = 0;

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

    console.log(`\n📧 ${teacher.user.email}`);
    console.log(`👤 ${teacher.user.name}`);
    console.log(`📚 Subject: ${Array.from(subjects).join(', ')}`);
    console.log(`⏰ Total hours: ${schedules.length}`);

    // Check for time conflicts
    const timeSlots = new Map<string, any[]>();

    for (const s of schedules) {
      const timeKey = `${s.dayOfWeek}-${s.startTime.toTimeString().substring(0, 5)}`;
      if (!timeSlots.has(timeKey)) {
        timeSlots.set(timeKey, []);
      }
      timeSlots.get(timeKey)!.push(s);
    }

    let hasConflict = false;
    for (const [timeKey, slots] of timeSlots.entries()) {
      if (slots.length > 1) {
        console.log(`❌ CONFLICT at ${timeKey}: ${slots.length} classes`);
        slots.forEach(s => {
          console.log(`   - ${s.subject.name} (${s.class.name})`);
        });
        hasConflict = true;
        totalConflicts++;
      }
    }

    if (!hasConflict) {
      console.log(`✅ NO CONFLICTS`);
    }
  }

  console.log(`\n\n📊 SUMMARY:`);
  console.log(`Total teachers: ${teachers.length}`);
  console.log(`Teachers with conflicts: ${totalConflicts}`);
  console.log(`Status: ${totalConflicts === 0 ? '✅ ZERO CONFLICTS!' : '❌ HAS CONFLICTS'}`);

  await prisma.$disconnect();
}

properVerification();
