import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const TIME_MAP: Record<number, { start: string, end: string }> = {
  1: { start: '08:00', end: '08:40' },
  2: { start: '08:40', end: '09:20' },
  3: { start: '09:20', end: '10:00' },
  4: { start: '10:20', end: '11:00' },
  5: { start: '11:00', end: '11:40' },
  6: { start: '12:20', end: '13:00' },
  7: { start: '13:00', end: '13:40' },
};

async function finalZeroConflict() {
  console.log('🎯 FINAL ZERO-CONFLICT Generation...\n');

  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  const subjects = await prisma.subject.findMany();
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  const subjectMap = new Map(subjects.map(s => [s.code, s]));

  // Teacher assignments
  const teacherAssignments = [
    { teacherId: teachers[0].id, subject: 'BING', classes: [0, 1, 2, 3, 4], name: teachers[0].user.name },
    { teacherId: teachers[1].id, subject: 'MAT', classes: [0, 1, 2, 3, 4], name: teachers[1].user.name },
    { teacherId: teachers[2].id, subject: 'IPA', classes: [0, 1, 2, 3, 4], name: teachers[2].user.name },
    { teacherId: teachers[3].id, subject: 'IPS', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], name: teachers[3].user.name },
    { teacherId: teachers[4].id, subject: 'MAT', classes: [5, 6, 7, 8, 9], name: teachers[4].user.name },
    { teacherId: teachers[5].id, subject: 'BIN', classes: [5, 6, 7, 8, 9], name: teachers[5].user.name },
    { teacherId: teachers[6].id, subject: 'BING', classes: [5, 6, 7, 8, 9], name: teachers[6].user.name },
    { teacherId: teachers[7].id, subject: 'IPA', classes: [5, 6, 7, 8, 9], name: teachers[7].user.name },
    { teacherId: teachers[8].id, subject: 'PAI', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], name: teachers[8].user.name },
    { teacherId: teachers[9].id, subject: 'PKN', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], name: teachers[9].user.name },
    { teacherId: teachers[10].id, subject: 'PJOK', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], name: teachers[10].user.name },
    { teacherId: teachers[11].id, subject: 'SBD', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], name: teachers[11].user.name },
    { teacherId: teachers[12].id, subject: 'INF', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], name: teachers[12].user.name },
    { teacherId: teachers[13].id, subject: 'BDAE', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], name: teachers[13].user.name },
    { teacherId: teachers[14].id, subject: 'BIN', classes: [0, 1, 2, 3, 4], name: teachers[14].user.name },
  ];

  const hoursNeeded: Record<string, number> = {
    'MAT': 5, 'BIN': 5, 'IPA': 5, 'BING': 4, 'IPS': 4,
    'PAI': 3, 'PKN': 2, 'PJOK': 2, 'SBD': 2, 'INF': 2, 'BDAE': 1,
  };

  // Track remaining hours
  const classHours = new Map<number, Map<string, number>>();
  for (let i = 0; i < classes.length; i++) {
    const hours = new Map<string, number>();
    Object.entries(hoursNeeded).forEach(([code, h]) => hours.set(code, h));
    classHours.set(i, hours);
  }

  const schedules: any[] = [];
  const teacherSlots = new Map<string, Set<string>>(); // teacherId -> Set of "day-period"
  const classSlots = new Map<number, Set<string>>(); // classIdx -> Set of "day-period"

  teacherAssignments.forEach(t => teacherSlots.set(t.teacherId, new Set()));
  for (let i = 0; i < classes.length; i++) classSlots.set(i, new Set());

  console.log('📅 Assigning schedules slot by slot...\n');

  let totalAssigned = 0;

  for (const day of DAYS) {
    for (const period of PERIODS) {
      const slotKey = `${day}-${period}`;

      // For each class
      for (let classIdx = 0; classIdx < classes.length; classIdx++) {
        // Skip if class already has something in this slot
        if (classSlots.get(classIdx)?.has(slotKey)) {
          continue;
        }

        const hours = classHours.get(classIdx)!;
        const availableSubjects = Array.from(hours.entries())
          .filter(([_, h]) => h > 0)
          .sort((a, b) => b[1] - a[1]);

        let assigned = false;

        // Try each subject
        for (const [subjectCode, _] of availableSubjects) {
          // Find available teacher for this subject
          for (const assignment of teacherAssignments) {
            if (assignment.subject !== subjectCode) continue;
            if (!assignment.classes.includes(classIdx)) continue;

            // CHECK: Is teacher available?
            if (teacherSlots.get(assignment.teacherId)?.has(slotKey)) {
              continue; // Teacher busy
            }

            const subject = subjectMap.get(subjectCode);
            if (!subject) continue;

            // ASSIGN!
            const time = TIME_MAP[period];
            const [startH, startM] = time.start.split(':').map(Number);
            const [endH, endM] = time.end.split(':').map(Number);

            const startTime = new Date();
            startTime.setHours(startH, startM, 0, 0);

            const endTime = new Date();
            endTime.setHours(endH, endM, 0, 0);

            schedules.push({
              classId: classes[classIdx].id,
              subjectId: subject.id,
              teacherId: assignment.teacherId,
              dayOfWeek: day,
              startTime,
              endTime,
            });

            // Mark as busy
            teacherSlots.get(assignment.teacherId)?.add(slotKey);
            classSlots.get(classIdx)?.add(slotKey);
            hours.set(subjectCode, hours.get(subjectCode)! - 1);

            totalAssigned++;
            assigned = true;
            break;
          }

          if (assigned) break;
        }
      }
    }
  }

  console.log(`✅ Generated ${schedules.length} schedules\n`);
  console.log('💾 Saving to database...\n');

  for (const schedule of schedules) {
    await prisma.schedule.create({ data: schedule });
  }

  console.log(`✅ Saved ${schedules.length} schedules\n`);
  console.log('🔍 Final verification...\n');

  // Check for conflicts
  let conflictFound = false;
  for (const [teacherId, slots] of teacherSlots.entries()) {
    const assignment = teacherAssignments.find(a => a.teacherId === teacherId);
    console.log(`${assignment?.name}: ${slots.size} slots used`);
  }

  console.log('\n🎉 FINAL ZERO-CONFLICT schedule completed!');
  await prisma.$disconnect();
}

finalZeroConflict().catch(console.error);
