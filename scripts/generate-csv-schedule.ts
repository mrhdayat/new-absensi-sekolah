import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const TIME_MAP: Record<number, { start: string, end: string }> = {
  1: { start: '08:00', end: '08:40' },
  2: { start: '08:40', end: '09:20' },
  3: { start: '09:20', end: '10:00' },
  // Break 10:00-10:20
  4: { start: '10:20', end: '11:00' },
  5: { start: '11:00', end: '11:40' },
  // Break 11:40-12:20
  6: { start: '12:20', end: '13:00' },
  7: { start: '13:00', end: '13:40' },
};

async function generateCsvSchedule() {
  console.log('Generating Conflict-Free Schedule CSV...\n');

  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  const subjects = await prisma.subject.findMany();
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  const subjectMap = new Map(subjects.map(s => [s.code, s]));
  const teacherByNip = new Map(teachers.map(t => [t.id, t.nip]));

  // Teacher assignments matching the conflict-free logic
  const teacherAssignments = [
    { teacherId: teachers[0].id, subject: 'BING', classes: [0, 1, 2, 3, 4] },       // Ahmad Fauzi
    { teacherId: teachers[1].id, subject: 'MAT', classes: [0, 1, 2, 3, 4] },        // Budi Santoso
    { teacherId: teachers[2].id, subject: 'IPA', classes: [0, 1, 2, 3, 4] },        // Dewi Lestari
    { teacherId: teachers[3].id, subject: 'IPS', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Eko Prasetyo
    { teacherId: teachers[4].id, subject: 'MAT', classes: [5, 6, 7, 8, 9] },        // Fitri Handayani
    { teacherId: teachers[5].id, subject: 'BIN', classes: [5, 6, 7, 8, 9] },        // Hendra Wijaya
    { teacherId: teachers[6].id, subject: 'BING', classes: [5, 6, 7, 8, 9] },       // Indah Permata
    { teacherId: teachers[7].id, subject: 'IPA', classes: [5, 6, 7, 8, 9] },        // Joko Susilo
    { teacherId: teachers[8].id, subject: 'PAI', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Kartika Sari
    { teacherId: teachers[9].id, subject: 'PKN', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Lukman Hakim
    { teacherId: teachers[10].id, subject: 'PJOK', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Maya Anggraini
    { teacherId: teachers[11].id, subject: 'SBD', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Nurul Hidayah
    { teacherId: teachers[12].id, subject: 'INF', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Oki Setiawan
    { teacherId: teachers[13].id, subject: 'BDAE', classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Putri Rahayu
    { teacherId: teachers[14].id, subject: 'BIN', classes: [0, 1, 2, 3, 4] },       // Siti Nurhaliza
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

  const csvRows: string[] = [];
  // Header match: className,subjectCode,teacherNIP,dayOfWeek,startTime,endTime,room
  csvRows.push('className,subjectCode,teacherNIP,dayOfWeek,startTime,endTime,room');

  const teacherSlots = new Map<string, Set<string>>();
  const classSlots = new Map<number, Set<string>>();

  teacherAssignments.forEach(t => teacherSlots.set(t.teacherId, new Set()));
  for (let i = 0; i < classes.length; i++) classSlots.set(i, new Set());

  for (const day of DAYS) {
    for (const period of PERIODS) {
      const slotKey = `${day}-${period}`;

      for (let classIdx = 0; classIdx < classes.length; classIdx++) {
        if (classSlots.get(classIdx)?.has(slotKey)) continue;

        const hours = classHours.get(classIdx)!;
        const availableSubjects = Array.from(hours.entries())
          .filter(([_, h]) => h > 0)
          .sort((a, b) => b[1] - a[1]);

        // Try to find a valid assignment
        for (const [subjectCode, _] of availableSubjects) {
          const assignment = teacherAssignments.find(a =>
            a.subject === subjectCode &&
            a.classes.includes(classIdx) &&
            !teacherSlots.get(a.teacherId)?.has(slotKey)
          );

          if (assignment) {
            const time = TIME_MAP[period];
            const teacherNip = teacherByNip.get(assignment.teacherId);
            if (!teacherNip) {
              console.error(`Missing NIP for teacher ${assignment.teacherId}`);
              continue;
            }

            csvRows.push([
              classes[classIdx].name,
              subjectCode,
              teacherNip,
              day,
              time.start,
              time.end,
              `Ruang ${classes[classIdx].name}`
            ].join(','));

            teacherSlots.get(assignment.teacherId)?.add(slotKey);
            classSlots.get(classIdx)?.add(slotKey);
            hours.set(subjectCode, hours.get(subjectCode)! - 1);
            break; // Move to next class
          }
        }
      }
    }
  }

  const outputPath = path.join(process.cwd(), 'public', 'schedules.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'));
  console.log(`✅ CSV generated at: ${outputPath}`);
  console.log(`Total rows: ${csvRows.length - 1}`);

  await prisma.$disconnect();
}

generateCsvSchedule().catch(console.error);
