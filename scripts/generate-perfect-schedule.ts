import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// Time slots with breaks
const TIME_SLOTS = [
  { period: 1, start: '08:00', end: '08:40' },
  { period: 2, start: '08:40', end: '09:20' },
  { period: 3, start: '09:20', end: '10:00' },
  // Break 10:00 - 10:20
  { period: 4, start: '10:20', end: '11:00' },
  { period: 5, start: '11:00', end: '11:40' },
  // Break 11:40 - 12:20
  { period: 6, start: '12:20', end: '13:00' },
  { period: 7, start: '13:00', end: '13:40' },
];

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

// Subject allocation per class per week
const SUBJECT_ALLOCATION: Record<string, number> = {
  'MAT': 5,   // Matematika
  'BIN': 5,   // Bahasa Indonesia
  'IPA': 5,   // IPA
  'BING': 4,  // Bahasa Inggris
  'IPS': 4,   // IPS
  'PAI': 3,   // Pendidikan Agama
  'PKN': 2,   // PPKn
  'PJOK': 2,  // PJOK
  'SBD': 2,   // Seni Budaya
  'INF': 2,   // Informatika
  'BDAE': 1,  // Bahasa Daerah
};

interface ScheduleEntry {
  classId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
}

async function generatePerfectSchedule() {
  console.log('🎯 Generating PERFECT anti-conflict schedule...\n');

  // Load data
  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  const subjects = await prisma.subject.findMany();
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true } } },
  });

  console.log(`📊 Loaded: ${classes.length} classes, ${subjects.length} subjects, ${teachers.length} teachers\n`);

  // Map subjects by code
  const subjectMap = new Map(subjects.map(s => [s.code, s]));

  // Assign teachers to subjects (following user's G1-G15 pattern)
  const teacherAssignments = [
    { teacherId: teachers[0].id, subjectCode: 'MAT', label: 'G1', classes: [0, 1, 2, 3, 4] },      // Matematika A
    { teacherId: teachers[5].id, subjectCode: 'MAT', label: 'G2', classes: [5, 6, 7, 8, 9] },      // Matematika B
    { teacherId: teachers[1].id, subjectCode: 'BIN', label: 'G3', classes: [0, 1, 2, 3, 4] },      // B.Indonesia A
    { teacherId: teachers[6].id, subjectCode: 'BIN', label: 'G4', classes: [5, 6, 7, 8, 9] },      // B.Indonesia B
    { teacherId: teachers[3].id, subjectCode: 'IPA', label: 'G5', classes: [0, 1, 2, 3, 4] },      // IPA A
    { teacherId: teachers[8].id, subjectCode: 'IPA', label: 'G6', classes: [5, 6, 7, 8, 9] },      // IPA B
    { teacherId: teachers[2].id, subjectCode: 'BING', label: 'G7', classes: [0, 1, 2, 3, 4] },     // B.Inggris A
    { teacherId: teachers[7].id, subjectCode: 'BING', label: 'G8', classes: [5, 6, 7, 8, 9] },     // B.Inggris B
    { teacherId: teachers[4].id, subjectCode: 'IPS', label: 'G9', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },  // IPS
    { teacherId: teachers[10].id, subjectCode: 'PKN', label: 'G10', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // PPKn
    { teacherId: teachers[9].id, subjectCode: 'PAI', label: 'G11', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },  // Agama
    { teacherId: teachers[11].id, subjectCode: 'PJOK', label: 'G12', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // PJOK
    { teacherId: teachers[12].id, subjectCode: 'SBD', label: 'G13', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },  // Seni Budaya
    { teacherId: teachers[13].id, subjectCode: 'INF', label: 'G14', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },  // Informatika
    { teacherId: teachers[14].id, subjectCode: 'BDAE', label: 'G15', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // B.Daerah
  ];

  // Track remaining hours needed per class per subject
  const classSubjectHours = new Map<string, Map<string, number>>();
  for (const cls of classes) {
    const subjectHours = new Map<string, number>();
    Object.entries(SUBJECT_ALLOCATION).forEach(([code, hours]) => {
      subjectHours.set(code, hours);
    });
    classSubjectHours.set(cls.id, subjectHours);
  }

  const scheduleEntries: ScheduleEntry[] = [];
  const teacherBusy = new Map<string, Set<string>>(); // teacherId -> Set of "day-period"
  const classBusy = new Map<string, Set<string>>(); // classId -> Set of "day-period"

  // Initialize busy tracking
  teachers.forEach(t => teacherBusy.set(t.id, new Set()));
  classes.forEach(c => classBusy.set(c.id, new Set()));

  console.log('📅 Generating schedule with rotation pattern...\n');

  // Generate schedule day by day, period by period
  for (const day of DAYS) {
    console.log(`   ${day}...`);

    for (const timeSlot of TIME_SLOTS) {
      const slotKey = `${day}-${timeSlot.period}`;

      // For each class, assign a subject
      for (let classIndex = 0; classIndex < classes.length; classIndex++) {
        const classData = classes[classIndex];
        const classHours = classSubjectHours.get(classData.id)!;

        // Find available subject that still needs hours
        let assigned = false;

        // Try subjects in priority order (high hours first)
        const sortedSubjects = Array.from(classHours.entries())
          .filter(([_, hours]) => hours > 0)
          .sort((a, b) => b[1] - a[1]); // Sort by remaining hours descending

        for (const [subjectCode, remainingHours] of sortedSubjects) {
          if (remainingHours <= 0) continue;

          // Find teacher for this subject who can teach this class
          const assignment = teacherAssignments.find(a =>
            a.subjectCode === subjectCode &&
            a.classes.includes(classIndex)
          );

          if (!assignment) continue;

          // Check if teacher and class are both available
          const teacherAvailable = !teacherBusy.get(assignment.teacherId)?.has(slotKey);
          const classAvailable = !classBusy.get(classData.id)?.has(slotKey);

          if (teacherAvailable && classAvailable) {
            const subject = subjectMap.get(subjectCode);
            if (!subject) continue;

            // Assign this slot
            scheduleEntries.push({
              classId: classData.id,
              subjectId: subject.id,
              teacherId: assignment.teacherId,
              day,
              period: timeSlot.period,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
            });

            // Mark as busy
            teacherBusy.get(assignment.teacherId)?.add(slotKey);
            classBusy.get(classData.id)?.add(slotKey);

            // Decrease remaining hours
            classHours.set(subjectCode, remainingHours - 1);

            assigned = true;
            break;
          }
        }

        if (!assigned) {
          // If we can't assign, try any available teacher for any subject
          for (const [subjectCode, remainingHours] of sortedSubjects) {
            if (remainingHours <= 0) continue;

            const assignment = teacherAssignments.find(a => a.subjectCode === subjectCode);
            if (!assignment) continue;

            const teacherAvailable = !teacherBusy.get(assignment.teacherId)?.has(slotKey);
            const classAvailable = !classBusy.get(classData.id)?.has(slotKey);

            if (teacherAvailable && classAvailable) {
              const subject = subjectMap.get(subjectCode);
              if (!subject) continue;

              scheduleEntries.push({
                classId: classData.id,
                subjectId: subject.id,
                teacherId: assignment.teacherId,
                day,
                period: timeSlot.period,
                startTime: timeSlot.start,
                endTime: timeSlot.end,
              });

              teacherBusy.get(assignment.teacherId)?.add(slotKey);
              classBusy.get(classData.id)?.add(slotKey);
              classHours.set(subjectCode, remainingHours - 1);

              assigned = true;
              break;
            }
          }
        }
      }
    }
  }

  console.log(`\n✅ Generated ${scheduleEntries.length} schedule entries\n`);

  // Clear old schedules
  console.log('🗑️  Clearing old schedules...');
  await prisma.schedule.deleteMany({});

  // Insert new schedules
  console.log('💾 Inserting new schedules...');

  for (const entry of scheduleEntries) {
    const [hours, minutes] = entry.startTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);

    const [endHours, endMinutes] = entry.endTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(endHours, endMinutes, 0, 0);

    await prisma.schedule.create({
      data: {
        classId: entry.classId,
        subjectId: entry.subjectId,
        teacherId: entry.teacherId,
        dayOfWeek: entry.day as any,
        startTime,
        endTime,
      },
    });
  }

  console.log(`✅ Inserted ${scheduleEntries.length} schedules\n`);

  // Show teacher workload
  console.log('📊 Teacher Workload:');
  const workload = new Map<string, number>();
  for (const entry of scheduleEntries) {
    const teacher = teachers.find(t => t.id === entry.teacherId);
    if (teacher) {
      workload.set(teacher.user.name, (workload.get(teacher.user.name) || 0) + 1);
    }
  }

  for (const [name, hours] of workload.entries()) {
    console.log(`   ${name}: ${hours} hours/week`);
  }

  console.log('\n🎉 Perfect anti-conflict schedule generated!');
  await prisma.$disconnect();
}

generatePerfectSchedule().catch(console.error);
