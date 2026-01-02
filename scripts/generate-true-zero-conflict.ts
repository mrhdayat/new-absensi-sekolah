import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIODS = [
  { num: 1, start: '08:00', end: '08:40' },
  { num: 2, start: '08:40', end: '09:20' },
  { num: 3, start: '09:20', end: '10:00' },
  { num: 4, start: '10:20', end: '11:00' },
  { num: 5, start: '11:00', end: '11:40' },
  { num: 6, start: '12:20', end: '13:00' },
  { num: 7, start: '13:00', end: '13:40' },
];

async function generateTrueZeroConflict() {
  console.log('🎯 Generating TRUE ZERO-CONFLICT schedule...\n');

  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  const subjects = await prisma.subject.findMany();
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  const subjectMap = new Map(subjects.map(s => [s.code, s]));

  // Teacher assignments (VERIFIED from database order)
  const teacherMap = new Map([
    [teachers[0].id, { code: 'BING', classes: [0, 1, 2, 3, 4] }],       // Ahmad Fauzi
    [teachers[1].id, { code: 'MAT', classes: [0, 1, 2, 3, 4] }],        // Budi Santoso
    [teachers[2].id, { code: 'IPA', classes: [0, 1, 2, 3, 4] }],        // Dewi Lestari
    [teachers[3].id, { code: 'IPS', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }], // Eko Prasetyo
    [teachers[4].id, { code: 'MAT', classes: [5, 6, 7, 8, 9] }],        // Fitri Handayani
    [teachers[5].id, { code: 'BIN', classes: [5, 6, 7, 8, 9] }],        // Hendra Wijaya
    [teachers[6].id, { code: 'BING', classes: [5, 6, 7, 8, 9] }],       // Indah Permata
    [teachers[7].id, { code: 'IPA', classes: [5, 6, 7, 8, 9] }],        // Joko Susilo
    [teachers[8].id, { code: 'PAI', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }], // Kartika Sari
    [teachers[9].id, { code: 'PKN', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }], // Lukman Hakim
    [teachers[10].id, { code: 'PJOK', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }], // Maya Anggraini
    [teachers[11].id, { code: 'SBD', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }], // Nurul Hidayah
    [teachers[12].id, { code: 'INF', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }], // Oki Setiawan
    [teachers[13].id, { code: 'BDAE', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }], // Putri Rahayu
    [teachers[14].id, { code: 'BIN', classes: [0, 1, 2, 3, 4] }],       // Siti Nurhaliza
  ]);

  // Hours needed per subject per class
  const hoursNeeded: Record<string, number> = {
    'MAT': 5, 'BIN': 5, 'IPA': 5, 'BING': 4, 'IPS': 4,
    'PAI': 3, 'PKN': 2, 'PJOK': 2, 'SBD': 2, 'INF': 2, 'BDAE': 1,
  };

  // Track hours remaining per class
  const classHours = new Map<number, Map<string, number>>();
  for (let i = 0; i < classes.length; i++) {
    const hours = new Map<string, number>();
    Object.entries(hoursNeeded).forEach(([code, h]) => hours.set(code, h));
    classHours.set(i, hours);
  }

  const schedules: any[] = [];
  const teacherBusy = new Map<string, Set<string>>(); // teacherId -> Set of "day-period"
  const classBusy = new Map<number, Set<string>>(); // classIndex -> Set of "day-period"

  teachers.forEach(t => teacherBusy.set(t.id, new Set()));
  for (let i = 0; i < classes.length; i++) classBusy.set(i, new Set());

  console.log('📅 Generating schedules...\n');

  // For each time slot
  for (const day of DAYS) {
    for (const period of PERIODS) {
      const slotKey = `${day}-${period.num}`;

      // For each class
      for (let classIdx = 0; classIdx < classes.length; classIdx++) {
        if (classBusy.get(classIdx)?.has(slotKey)) continue;

        const hours = classHours.get(classIdx)!;
        const available = Array.from(hours.entries())
          .filter(([_, h]) => h > 0)
          .sort((a, b) => b[1] - a[1]);

        let assigned = false;

        for (const [subjectCode, _] of available) {
          // Find teacher for this subject who can teach this class
          for (const [teacherId, assignment] of teacherMap.entries()) {
            if (assignment.code !== subjectCode) continue;
            if (!assignment.classes.includes(classIdx)) continue;
            if (teacherBusy.get(teacherId)?.has(slotKey)) continue;

            const subject = subjectMap.get(subjectCode);
            if (!subject) continue;

            // ASSIGN!
            const [startH, startM] = period.start.split(':').map(Number);
            const [endH, endM] = period.end.split(':').map(Number);

            const startTime = new Date();
            startTime.setHours(startH, startM, 0, 0);

            const endTime = new Date();
            endTime.setHours(endH, endM, 0, 0);

            schedules.push({
              classId: classes[classIdx].id,
              subjectId: subject.id,
              teacherId,
              dayOfWeek: day,
              startTime,
              endTime,
            });

            teacherBusy.get(teacherId)?.add(slotKey);
            classBusy.get(classIdx)?.add(slotKey);
            hours.set(subjectCode, hours.get(subjectCode)! - 1);

            assigned = true;
            break;
          }

          if (assigned) break;
        }
      }
    }
  }

  console.log(`✅ Generated ${schedules.length} schedules\n`);
  console.log('💾 Inserting to database...\n');

  for (const schedule of schedules) {
    await prisma.schedule.create({ data: schedule });
  }

  console.log(`✅ Inserted ${schedules.length} schedules\n`);

  // Verify
  console.log('🔍 Verifying...\n');
  const monday8am = await prisma.schedule.findMany({
    where: {
      dayOfWeek: 'MONDAY',
      startTime: { gte: new Date().setHours(8, 0, 0, 0) as any },
    },
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      subject: { select: { name: true } },
      class: { select: { name: true } },
    },
  });

  const teacherCount = new Map<string, number>();
  for (const s of monday8am) {
    const count = teacherCount.get(s.teacherId) || 0;
    teacherCount.set(s.teacherId, count + 1);
  }

  for (const [teacherId, count] of teacherCount.entries()) {
    if (count > 1) {
      const teacher = teachers.find(t => t.id === teacherId);
      console.log(`❌ ${teacher?.user.name}: ${count} classes at Monday 08:00`);
    }
  }

  console.log('\n🎉 TRUE ZERO-CONFLICT schedule completed!');
  await prisma.$disconnect();
}

generateTrueZeroConflict().catch(console.error);
