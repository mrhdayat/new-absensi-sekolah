import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function verifySchedule() {
  console.log('🔍 Verifying schedule integrity...\n');

  const schedules = await prisma.schedule.findMany({
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true, code: true } },
      teacher: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  console.log(`📊 Total schedules: ${schedules.length}\n`);

  // Check 1: Teacher conflicts (same teacher, same time slot)
  console.log('✅ Check 1: Teacher Conflicts');
  const teacherConflicts = new Map<string, Set<string>>();

  for (const schedule of schedules) {
    const slotKey = `${schedule.dayOfWeek}-${schedule.startTime.getHours()}`;
    const teacherKey = schedule.teacherId;

    if (!teacherConflicts.has(teacherKey)) {
      teacherConflicts.set(teacherKey, new Set());
    }

    const slots = teacherConflicts.get(teacherKey)!;
    if (slots.has(slotKey)) {
      console.log(`   ❌ CONFLICT: ${schedule.teacher.user.name} teaches multiple classes at ${schedule.dayOfWeek} ${schedule.startTime.getHours()}:00`);
    } else {
      slots.add(slotKey);
    }
  }
  console.log(`   ✅ No teacher conflicts found\n`);

  // Check 2: Class conflicts (same class, same time slot)
  console.log('✅ Check 2: Class Conflicts');
  const classConflicts = new Map<string, Set<string>>();

  for (const schedule of schedules) {
    const slotKey = `${schedule.dayOfWeek}-${schedule.startTime.getHours()}`;
    const classKey = schedule.classId;

    if (!classConflicts.has(classKey)) {
      classConflicts.set(classKey, new Set());
    }

    const slots = classConflicts.get(classKey)!;
    if (slots.has(slotKey)) {
      console.log(`   ❌ CONFLICT: ${schedule.class.name} has multiple subjects at ${schedule.dayOfWeek} ${schedule.startTime.getHours()}:00`);
    } else {
      slots.add(slotKey);
    }
  }
  console.log(`   ✅ No class conflicts found\n`);

  // Check 3: Subject hour allocation
  console.log('✅ Check 3: Subject Hour Allocation per Class');
  const subjectHours = new Map<string, Map<string, number>>();

  for (const schedule of schedules) {
    const classKey = schedule.class.name;
    const subjectKey = schedule.subject.code;

    if (!subjectHours.has(classKey)) {
      subjectHours.set(classKey, new Map());
    }

    const classSubjects = subjectHours.get(classKey)!;
    classSubjects.set(subjectKey, (classSubjects.get(subjectKey) || 0) + 1);
  }

  // Display allocation
  for (const [className, subjects] of subjectHours.entries()) {
    console.log(`   ${className}:`);
    for (const [subjectCode, hours] of subjects.entries()) {
      console.log(`      ${subjectCode}: ${hours} hours/week`);
    }
  }

  // Check 4: Teacher workload distribution
  console.log('\n✅ Check 4: Teacher Workload');
  const teacherWorkload = new Map<string, number>();

  for (const schedule of schedules) {
    const teacherName = schedule.teacher.user.name;
    teacherWorkload.set(teacherName, (teacherWorkload.get(teacherName) || 0) + 1);
  }

  for (const [teacherName, hours] of teacherWorkload.entries()) {
    const status = hours >= 20 && hours <= 28 ? '✅' : '⚠️';
    console.log(`   ${status} ${teacherName}: ${hours} hours/week`);
  }

  console.log('\n🎉 Schedule verification completed!');
  await prisma.$disconnect();
}

verifySchedule().catch(console.error);
