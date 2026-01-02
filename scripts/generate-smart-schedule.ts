import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// Subject allocation per week per class
const SUBJECT_HOURS: Record<string, number> = {
  'MAT': 5,   // Matematika
  'BIN': 5,   // Bahasa Indonesia
  'IPA': 5,   // IPA
  'BING': 4,  // Bahasa Inggris
  'IPS': 4,   // IPS
  'PAI': 3,   // Pendidikan Agama Islam
  'PKN': 2,   // PPKn
  'PJOK': 2,  // PJOK
  'SBD': 2,   // Seni Budaya
  'INF': 2,   // Informatika
  'BDAE': 1,  // Bahasa Daerah
};

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIODS_PER_DAY = 7;

interface ScheduleSlot {
  classId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  period: number;
}

interface TeacherWorkload {
  teacherId: string;
  subjectCode: string;
  assignedClasses: string[];
  totalHours: number;
}

async function generateSmartSchedule() {
  console.log('🧠 Starting intelligent schedule generation...\n');

  // Get all data
  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  const subjects = await prisma.subject.findMany();
  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: { name: true, role: true },
      },
    },
  });

  console.log(`📊 Data loaded:`);
  console.log(`   - ${classes.length} classes`);
  console.log(`   - ${subjects.length} subjects`);
  console.log(`   - ${teachers.length} teachers\n`);

  // Map subjects by code
  const subjectMap = new Map(subjects.map(s => [s.code, s]));

  // Assign teachers to subjects with class distribution
  const teacherAssignments: TeacherWorkload[] = [
    // Matematika - 2 teachers (5 hours × 10 classes = 50 hours total)
    { teacherId: teachers[0].id, subjectCode: 'MAT', assignedClasses: classes.slice(0, 5).map(c => c.id), totalHours: 0 },
    { teacherId: teachers[5].id, subjectCode: 'MAT', assignedClasses: classes.slice(5, 10).map(c => c.id), totalHours: 0 },

    // Bahasa Indonesia - 2 teachers
    { teacherId: teachers[1].id, subjectCode: 'BIN', assignedClasses: classes.slice(0, 5).map(c => c.id), totalHours: 0 },
    { teacherId: teachers[6].id, subjectCode: 'BIN', assignedClasses: classes.slice(5, 10).map(c => c.id), totalHours: 0 },

    // Bahasa Inggris - 2 teachers
    { teacherId: teachers[2].id, subjectCode: 'BING', assignedClasses: classes.slice(0, 5).map(c => c.id), totalHours: 0 },
    { teacherId: teachers[7].id, subjectCode: 'BING', assignedClasses: classes.slice(5, 10).map(c => c.id), totalHours: 0 },

    // IPA - 2 teachers
    { teacherId: teachers[3].id, subjectCode: 'IPA', assignedClasses: classes.slice(0, 5).map(c => c.id), totalHours: 0 },
    { teacherId: teachers[8].id, subjectCode: 'IPA', assignedClasses: classes.slice(5, 10).map(c => c.id), totalHours: 0 },

    // IPS - 1 teacher (all classes)
    { teacherId: teachers[4].id, subjectCode: 'IPS', assignedClasses: classes.map(c => c.id), totalHours: 0 },

    // Pendidikan Agama - 1 teacher
    { teacherId: teachers[9].id, subjectCode: 'PAI', assignedClasses: classes.map(c => c.id), totalHours: 0 },

    // PPKn - 1 teacher
    { teacherId: teachers[10].id, subjectCode: 'PKN', assignedClasses: classes.map(c => c.id), totalHours: 0 },

    // PJOK - 1 teacher
    { teacherId: teachers[11].id, subjectCode: 'PJOK', assignedClasses: classes.map(c => c.id), totalHours: 0 },

    // Seni Budaya - 1 teacher
    { teacherId: teachers[12].id, subjectCode: 'SBD', assignedClasses: classes.map(c => c.id), totalHours: 0 },

    // Informatika - 1 teacher
    { teacherId: teachers[13].id, subjectCode: 'INF', assignedClasses: classes.map(c => c.id), totalHours: 0 },

    // Bahasa Daerah - 1 teacher
    { teacherId: teachers[14].id, subjectCode: 'BDAE', assignedClasses: classes.map(c => c.id), totalHours: 0 },
  ];

  // Build schedule grid (anti-conflict)
  const scheduleSlots: ScheduleSlot[] = [];
  const teacherBusySlots = new Map<string, Set<string>>(); // teacherId -> Set of "day-period"
  const classBusySlots = new Map<string, Set<string>>(); // classId -> Set of "day-period"

  // Initialize busy slots
  teachers.forEach(t => teacherBusySlots.set(t.id, new Set()));
  classes.forEach(c => classBusySlots.set(c.id, new Set()));

  // Helper function to check if slot is available
  const isSlotAvailable = (teacherId: string, classId: string, day: string, period: number): boolean => {
    const slotKey = `${day}-${period}`;
    const teacherBusy = teacherBusySlots.get(teacherId)?.has(slotKey);
    const classBusy = classBusySlots.get(classId)?.has(slotKey);
    return !teacherBusy && !classBusy;
  };

  // Helper function to mark slot as busy
  const markSlotBusy = (teacherId: string, classId: string, day: string, period: number) => {
    const slotKey = `${day}-${period}`;
    teacherBusySlots.get(teacherId)?.add(slotKey);
    classBusySlots.get(classId)?.add(slotKey);
  };

  console.log('📅 Generating conflict-free schedule...\n');

  // For each class, assign all required subjects
  for (const classData of classes) {
    console.log(`   Processing ${classData.name}...`);

    // Track hours needed per subject for this class
    const subjectHoursNeeded = new Map<string, number>();
    Object.entries(SUBJECT_HOURS).forEach(([code, hours]) => {
      subjectHoursNeeded.set(code, hours);
    });

    // Try to fill all periods for this class
    for (const day of DAYS) {
      for (let period = 1; period <= PERIODS_PER_DAY; period++) {
        // Find a subject that still needs hours
        let assigned = false;

        for (const [subjectCode, hoursNeeded] of subjectHoursNeeded.entries()) {
          if (hoursNeeded <= 0) continue;

          // Find teacher for this subject who can teach this class
          const assignment = teacherAssignments.find(
            a => a.subjectCode === subjectCode && a.assignedClasses.includes(classData.id)
          );

          if (!assignment) continue;

          // Check if slot is available
          if (isSlotAvailable(assignment.teacherId, classData.id, day, period)) {
            const subject = subjectMap.get(subjectCode);
            if (!subject) continue;

            // Assign this slot
            scheduleSlots.push({
              classId: classData.id,
              subjectId: subject.id,
              teacherId: assignment.teacherId,
              day,
              period,
            });

            // Mark slot as busy
            markSlotBusy(assignment.teacherId, classData.id, day, period);

            // Decrease hours needed
            subjectHoursNeeded.set(subjectCode, hoursNeeded - 1);
            assignment.totalHours++;

            assigned = true;
            break;
          }
        }

        if (!assigned) {
          // If we can't assign anything, try next period
          continue;
        }
      }
    }
  }

  console.log(`\n✅ Generated ${scheduleSlots.length} schedule slots\n`);

  // Clear existing schedules
  console.log('🗑️  Clearing old schedules...');
  await prisma.schedule.deleteMany({});

  // Insert new schedules
  console.log('💾 Inserting new schedules...');
  let insertCount = 0;

  for (const slot of scheduleSlots) {
    const startHour = 7 + (slot.period - 1);
    const startTime = new Date();
    startTime.setHours(startHour, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(startHour, 40, 0, 0);

    await prisma.schedule.create({
      data: {
        classId: slot.classId,
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
        dayOfWeek: slot.day as any,
        startTime,
        endTime,
      },
    });

    insertCount++;
  }

  console.log(`✅ Inserted ${insertCount} schedules\n`);

  // Show teacher workload
  console.log('📊 Teacher Workload Summary:\n');
  for (const assignment of teacherAssignments) {
    const teacher = teachers.find(t => t.id === assignment.teacherId);
    console.log(`${teacher?.user.name}: ${assignment.totalHours} hours/week (${assignment.subjectCode})`);
  }

  console.log('\n🎉 Smart schedule generation completed!');
  await prisma.$disconnect();
}

generateSmartSchedule().catch(console.error);
