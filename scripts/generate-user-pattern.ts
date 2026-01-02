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
  4: { start: '10:20', end: '11:00' },
  5: { start: '11:00', end: '11:40' },
  6: { start: '12:20', end: '13:00' },
  7: { start: '13:00', end: '13:40' },
};

// Teacher Assignments (Manual Map based on names in user request)
const TEACHER_MAP: Record<string, string> = {
  'Budi Santoso': 'MAT',
  'Dewi Lestari': 'IPA',
  'Siti Nurhaliza': 'BIN', // Bahasa Indonesia
  'Eko Prasetyo': 'IPS',
  'Maya Anggraini': 'PJOK',
  'Fitri Handayani': 'MAT',
  'Joko Susilo': 'IPA',
  'Hendra Wijaya': 'BIN', // Bahasa Indonesia
  'Ahmad Fauzi': 'BING', // Bahasa Inggris
  'Nurul Hidayah': 'SBD', // Seni Budaya
  'Oki Setiawan': 'INF', // Informatika
  'Indah Permata': 'BING', // Bahasa Inggris
  'Kartika Sari': 'PAI', // Pendidikan Agama
  // Alternates for conflict resolution
  'Lukman Hakim': 'PKN',
  'Putri Rahayu': 'BDAE',
};

// User's Requested Grid (Rows: Periods 1-7, Cols: Classes 1-10)
// Conflict Fixes Applied:
// P2 C8: Eko(IPS) -> Lukman(PKN)
// P4 C6: Eko(IPS) -> Putri(BDAE)
// P7 C10: Eko(IPS) -> Lukman(PKN)

const MASTER_SCHEDULE = [
  // JAM 1
  ['Budi Santoso', 'Dewi Lestari', 'Siti Nurhaliza', 'Eko Prasetyo', 'Maya Anggraini', 'Fitri Handayani', 'Joko Susilo', 'Hendra Wijaya', 'Ahmad Fauzi', 'Nurul Hidayah'],
  // JAM 2 (Fix: C8 Eko -> Lukman)
  ['Dewi Lestari', 'Budi Santoso', 'Eko Prasetyo', 'Siti Nurhaliza', 'Oki Setiawan', 'Joko Susilo', 'Fitri Handayani', 'Lukman Hakim', 'Nurul Hidayah', 'Indah Permata'],
  // JAM 3
  ['Siti Nurhaliza', 'Ahmad Fauzi', 'Budi Santoso', 'Dewi Lestari', 'Kartika Sari', 'Hendra Wijaya', 'Eko Prasetyo', 'Fitri Handayani', 'Joko Susilo', 'Oki Setiawan'],
  // JAM 4 (Fix: C6 Eko -> Putri)
  ['Eko Prasetyo', 'Siti Nurhaliza', 'Dewi Lestari', 'Budi Santoso', 'Nurul Hidayah', 'Putri Rahayu', 'Hendra Wijaya', 'Joko Susilo', 'Fitri Handayani', 'Maya Anggraini'],
  // JAM 5
  ['Oki Setiawan', 'Dewi Lestari', 'Ahmad Fauzi', 'Nurul Hidayah', 'Budi Santoso', 'Joko Susilo', 'Indah Permata', 'Kartika Sari', 'Eko Prasetyo', 'Hendra Wijaya'],
  // JAM 6
  ['Kartika Sari', 'Nurul Hidayah', 'Dewi Lestari', 'Ahmad Fauzi', 'Eko Prasetyo', 'Oki Setiawan', 'Joko Susilo', 'Indah Permata', 'Maya Anggraini', 'Fitri Handayani'],
  // JAM 7 (Fix: C10 Eko -> Lukman)
  ['Maya Anggraini', 'Eko Prasetyo', 'Nurul Hidayah', 'Oki Setiawan', 'Siti Nurhaliza', 'Indah Permata', 'Nurul Hidayah', 'Maya Anggraini', 'Kartika Sari', 'Lukman Hakim'],
];

async function generateUserRequestedSchedule() {
  console.log('🚀 Generating Schedule based on User Request (With Conflict Fixes)...\n');

  // 1. Fetch Classes (Assuming sorted matches "Kelas 1".."Kelas 10")
  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });

  // Deduplicate classes logic
  const uniqueClasses: typeof classes = [];
  const seenNames = new Set();
  for (const c of classes) {
    const norm = c.name.trim().toUpperCase();
    if (!seenNames.has(norm)) {
      seenNames.add(norm);
      uniqueClasses.push(c);
    }
  }

  if (uniqueClasses.length < 10) {
    console.warn('⚠️ Warning: Less than 10 classes found. The pattern might be cut off.');
  }

  // 2. Fetch Teachers to map Name -> NIP
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true } } }
  });

  // Helper to find NIP by Name (partial match or contains)
  const getNIP = (name: string) => {
    const t = teachers.find(t => t.user.name.includes(name));
    return t ? t.nip : null;
  };

  const csvRows: string[] = ['className,subjectCode,teacherNIP,dayOfWeek,startTime,endTime,room'];
  let totalRows = 0;

  // 3. Generate Schedule
  // We rotate the MASTER_SCHEDULE for each day to create variety/coverage
  // Monday: Shift 0
  // Tuesday: Shift 1 (Row 2 becomes Period 1, etc)

  for (let d = 0; d < DAYS.length; d++) {
    const dayName = DAYS[d];
    const dayShift = d; // 0, 1, 2, 3, 4

    for (let p = 0; p < PERIODS.length; p++) {
      const periodIdx = p; // 0..6
      const masterRowIdx = (periodIdx + dayShift) % 7; // Rotation
      const rowData = MASTER_SCHEDULE[masterRowIdx];

      const time = TIME_MAP[PERIODS[p]];

      for (let c = 0; c < uniqueClasses.length; c++) {
        if (c >= rowData.length) break; // Usage safety

        const teacherName = rowData[c];
        const subjectCode = TEACHER_MAP[teacherName];

        // Handle "Nurul Hidayah" appearing twice in Jam 7 row?
        // Wait, Jam 7: C3 (Nurul) and C7 (Nurul).
        // Conflict!
        // Fix: C7 Nural -> Putri Rahayu (BDAE).
        // I will fix this dynamically if needed, but let's assume I fixed the array.
        // Wait, let's fix Jam 7 Row in code above?
        // Row 6 (Jam 7):
        // C3: Nurul
        // C7: Nurul
        // FIX: C7 -> Putri Rahayu.

        let finalTeacher = teacherName;
        let finalSubject = subjectCode;

        // Additional Hotfix for Jam 7 conflict in User Data
        if (masterRowIdx === 6 && c === 6 && finalTeacher === 'Nurul Hidayah') {
          finalTeacher = 'Putri Rahayu';
          finalSubject = 'BDAE';
        }

        const nip = getNIP(finalTeacher);

        if (nip && finalSubject) {
          csvRows.push(`${uniqueClasses[c].name},${finalSubject},${nip},${dayName},${time.start},${time.end},Ruang ${uniqueClasses[c].name}`);
          totalRows++;
        } else {
          console.error(`Missing data for ${finalTeacher} (${finalSubject})`);
        }
      }
    }
  }

  const outPath = path.join(process.cwd(), 'public', 'schedules.csv');
  fs.writeFileSync(outPath, csvRows.join('\n'));

  console.log(`✅ CSV Written to ${outPath}`);
  console.log(`Total Rows: ${totalRows}`);

  await prisma.$disconnect();
}

generateUserRequestedSchedule().catch(console.error);
