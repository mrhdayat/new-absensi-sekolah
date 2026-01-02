import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// Time slots (exact as per specification)
const TIME_SLOTS = [
  { period: 1, start: '08:00', end: '08:40' },
  { period: 2, start: '08:40', end: '09:20' },
  { period: 3, start: '09:20', end: '10:00' },
  { period: 4, start: '10:20', end: '11:00' },
  { period: 5, start: '11:00', end: '11:40' },
  { period: 6, start: '12:20', end: '13:00' },
  { period: 7, start: '13:00', end: '13:40' },
];

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

interface ScheduleSlot {
  classIndex: number;
  subjectCode: string;
  teacherIndex: number;
  day: string;
  period: number;
}

async function generateZeroConflictSchedule() {
  console.log('🎯 Generating ZERO-CONFLICT schedule...\n');

  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  const subjects = await prisma.subject.findMany();
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  console.log(`📊 ${classes.length} classes, ${subjects.length} subjects, ${teachers.length} teachers\n`);

  const subjectMap = new Map(subjects.map(s => [s.code, s]));

  // CRITICAL: Map each teacher to ONLY their subject (based on actual DB order)
  const teacherSubjectMap = new Map<number, string>([
    [0, 'BING'],  // Ahmad Fauzi -> B.Inggris (classes 0-4)
    [1, 'MAT'],   // Budi Santoso -> Matematika (classes 0-4)
    [2, 'IPA'],   // Dewi Lestari -> IPA (classes 0-4)
    [3, 'IPS'],   // Eko Prasetyo -> IPS (all classes)
    [4, 'MAT'],   // Fitri Handayani -> Matematika (classes 5-9)
    [5, 'BIN'],   // Hendra Wijaya -> B.Indonesia (classes 5-9)
    [6, 'BING'],  // Indah Permata -> B.Inggris (classes 5-9)
    [7, 'IPA'],   // Joko Susilo -> IPA (classes 5-9)
    [8, 'PAI'],   // Kartika Sari -> Agama (all classes)
    [9, 'PKN'],   // Lukman Hakim -> PPKn (all classes)
    [10, 'PJOK'], // Maya Anggraini -> PJOK (all classes)
    [11, 'SBD'],  // Nurul Hidayah -> Seni Budaya (all classes)
    [12, 'INF'],  // Oki Setiawan -> Informatika (all classes)
    [13, 'BDAE'], // Putri Rahayu -> B.Daerah (all classes)
    [14, 'BIN'],  // Siti Nurhaliza -> B.Indonesia (classes 0-4)
  ]);

  // Define which classes each teacher can teach
  const teacherClassMap = new Map<number, number[]>([
    [0, [0, 1, 2, 3, 4]],     // Ahmad Fauzi - BING A
    [1, [0, 1, 2, 3, 4]],     // Budi Santoso - MAT A
    [2, [0, 1, 2, 3, 4]],     // Dewi Lestari - IPA A
    [3, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], // Eko Prasetyo - IPS
    [4, [5, 6, 7, 8, 9]],     // Fitri Handayani - MAT B
    [5, [5, 6, 7, 8, 9]],     // Hendra Wijaya - BIN B
    [6, [5, 6, 7, 8, 9]],     // Indah Permata - BING B
    [7, [5, 6, 7, 8, 9]],     // Joko Susilo - IPA B
    [8, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],  // Kartika Sari - PAI
    [9, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],  // Lukman Hakim - PKN
    [10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], // Maya Anggraini - PJOK
    [11, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], // Nurul Hidayah - SBD
    [12, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], // Oki Setiawan - INF
    [13, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], // Putri Rahayu - BDAE
    [14, [0, 1, 2, 3, 4]],    // Siti Nurhaliza - BIN A
  ]);

  // Subject hours per class per week
  const subjectHours: Record<string, number> = {
    'MAT': 5, 'BIN': 5, 'IPA': 5, 'BING': 4, 'IPS': 4,
    'PAI': 3, 'PKN': 2, 'PJOK': 2, 'SBD': 2, 'INF': 2, 'BDAE': 1,
  };

  // Track remaining hours per class per subject
  const remainingHours = new Map<number, Map<string, number>>();
  for (let i = 0; i < classes.length; i++) {
    const hours = new Map<string, number>();
    Object.entries(subjectHours).forEach(([code, h]) => hours.set(code, h));
    remainingHours.set(i, hours);
  }

  const schedule: ScheduleSlot[] = [];
  const teacherBusy = new Map<number, Set<string>>(); // teacherIndex -> Set of "day-period"
  const classBusy = new Map<number, Set<string>>(); // classIndex -> Set of "day-period"

  // Initialize
  for (let i = 0; i < teachers.length; i++) teacherBusy.set(i, new Set());
  for (let i = 0; i < classes.length; i++) classBusy.set(i, new Set());

  console.log('📅 Generating schedule...\n');

  // For each day and period
  for (const day of DAYS) {
    for (const slot of TIME_SLOTS) {
      const slotKey = `${day}-${slot.period}`;

      // For each class, try to assign a subject
      for (let classIdx = 0; classIdx < classes.length; classIdx++) {
        if (classBusy.get(classIdx)?.has(slotKey)) continue;

        const classHours = remainingHours.get(classIdx)!;

        // Find subjects that still need hours
        const availableSubjects = Array.from(classHours.entries())
          .filter(([_, h]) => h > 0)
          .sort((a, b) => b[1] - a[1]); // Prioritize subjects with more remaining hours

        for (const [subjectCode, _] of availableSubjects) {
          // Find teacher for this subject who can teach this class
          let foundTeacher = false;

          for (let teacherIdx = 0; teacherIdx < teachers.length; teacherIdx++) {
            // Check if teacher teaches this subject
            if (teacherSubjectMap.get(teacherIdx) !== subjectCode) continue;

            // Check if teacher can teach this class
            if (!teacherClassMap.get(teacherIdx)?.includes(classIdx)) continue;

            // Check if teacher is available
            if (teacherBusy.get(teacherIdx)?.has(slotKey)) continue;

            // ASSIGN!
            schedule.push({
              classIndex: classIdx,
              subjectCode,
              teacherIndex: teacherIdx,
              day,
              period: slot.period,
            });

            // Mark as busy
            teacherBusy.get(teacherIdx)?.add(slotKey);
            classBusy.get(classIdx)?.add(slotKey);

            // Decrease hours
            classHours.set(subjectCode, classHours.get(subjectCode)! - 1);

            foundTeacher = true;
            break;
          }

          if (foundTeacher) break;
        }
      }
    }
  }

  console.log(`✅ Generated ${schedule.length} schedule slots\n`);

  // Clear old schedules
  console.log('🗑️  Clearing old schedules...');
  await prisma.schedule.deleteMany({});

  // Insert new schedules
  console.log('💾 Inserting schedules...');

  for (const slot of schedule) {
    const classData = classes[slot.classIndex];
    const subject = subjectMap.get(slot.subjectCode);
    const teacher = teachers[slot.teacherIndex];
    const timeSlot = TIME_SLOTS.find(t => t.period === slot.period)!;

    if (!subject || !teacher) continue;

    const [startHour, startMin] = timeSlot.start.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(startHour, startMin, 0, 0);

    const [endHour, endMin] = timeSlot.end.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    await prisma.schedule.create({
      data: {
        classId: classData.id,
        subjectId: subject.id,
        teacherId: teacher.id,
        dayOfWeek: slot.day as any,
        startTime,
        endTime,
      },
    });
  }

  console.log(`✅ Inserted ${schedule.length} schedules\n`);

  // Show workload
  console.log('📊 Teacher Workload:');
  const workload = new Map<number, number>();
  for (const slot of schedule) {
    workload.set(slot.teacherIndex, (workload.get(slot.teacherIndex) || 0) + 1);
  }

  for (let i = 0; i < teachers.length; i++) {
    const hours = workload.get(i) || 0;
    const subject = teacherSubjectMap.get(i);
    console.log(`   ${teachers[i].user.name}: ${hours} hours (${subject})`);
  }

  console.log('\n🎉 ZERO-CONFLICT schedule completed!');
  await prisma.$disconnect();
}

generateZeroConflictSchedule().catch(console.error);
