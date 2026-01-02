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

async function generateCsvV2() {
  console.log('🚀 Generating Conflict-Free Schedule CSV (V2 Robust)...\n');

  // 1. Fetch Classes and Deduplicate
  const allClasses = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  const uniqueClasses: typeof allClasses = [];
  const seenNames = new Set<string>();

  for (const c of allClasses) {
    const norm = c.name.trim().replace(/\s+/g, ' ').toUpperCase();
    if (seenNames.has(norm)) {
      console.log(`⚠️ Skipping duplicate class: "${c.name}" (ID: ${c.id})`);
    } else {
      seenNames.add(norm);
      uniqueClasses.push(c);
    }
  }
  console.log(`✅ Loaded ${uniqueClasses.length} unique classes.`);

  // 2. Fetch Teachers and Map by Email
  const teachers = await prisma.teacher.findMany({
    include: { user: { select: { name: true, email: true } } }
  });

  const teacherMap = new Map<string, string>(); // Email -> ID
  const teacherNip = new Map<string, string>(); // ID -> NIP

  teachers.forEach(t => {
    teacherMap.set(t.user.email, t.id);
    teacherNip.set(t.id, t.nip);
  });

  const subjects = await prisma.subject.findMany();
  const subjectMap = new Map(subjects.map(s => [s.code, s])); // Check if subject exists

  // 3. Define Assignments by Email (Robust)
  // X=0..4 (A,B,C,XI-A,XI-B etc... assuming sort 'asc' matches X-A, X-B...)
  // Let's print class order to be sure.
  console.log('Class Order: ' + uniqueClasses.map(c => c.name).join(', '));
  // Assuming 10 classes sorted: X-A, X-B, X-C, XI-A, XI-B, XI-C, XII-A, XII-B, XII-C, XII-D
  // Total 10.
  // indices 0..4 = X-A...XI-B
  // indices 5..9 = XI-C...XII-D

  const assignments = [
    { email: 'guru3@attendly.id', code: 'BING', access: 'lower' }, // Ahmad Fauzi
    { email: 'guru1@attendly.id', code: 'MAT', access: 'lower' }, // Budi Santoso
    { email: 'guru4@attendly.id', code: 'IPA', access: 'lower' }, // Dewi Lestari
    { email: 'guru2@attendly.id', code: 'BIN', access: 'lower' }, // Siti Nurhaliza

    { email: 'guru5@attendly.id', code: 'IPS', access: 'all' },   // Eko Prasetyo

    { email: 'guru6@attendly.id', code: 'MAT', access: 'upper' },  // Fitri Handayani
    { email: 'guru7@attendly.id', code: 'BIN', access: 'upper' },  // Hendra Wijaya
    { email: 'guru8@attendly.id', code: 'BING', access: 'upper' }, // Indah Permata
    { email: 'guru9@attendly.id', code: 'IPA', access: 'upper' },  // Joko Susilo

    { email: 'guru10@attendly.id', code: 'PAI', access: 'all' },  // Kartika Sari
    { email: 'guru11@attendly.id', code: 'PKN', access: 'all' },  // Lukman Hakim
    { email: 'guru12@attendly.id', code: 'PJOK', access: 'all' }, // Maya Anggraini
    { email: 'guru13@attendly.id', code: 'SBD', access: 'all' },  // Nurul Hidayah
    { email: 'guru14@attendly.id', code: 'INF', access: 'all' },  // Oki Setiawan
    { email: 'guru15@attendly.id', code: 'BDAE', access: 'all' }, // Putri Rahayu
  ];

  const hoursNeeded: Record<string, number> = {
    'MAT': 5, 'BIN': 5, 'IPA': 5, 'BING': 4, 'IPS': 4,
    'PAI': 3, 'PKN': 2, 'PJOK': 2, 'SBD': 2, 'INF': 2, 'BDAE': 1,
  };

  // 4. Init State
  const classState = new Map<number, Map<string, number>>();
  for (let i = 0; i < uniqueClasses.length; i++) {
    const hours = new Map();
    Object.entries(hoursNeeded).forEach(([k, v]) => hours.set(k, v));
    classState.set(i, hours);
  }

  const teacherBusy = new Map<string, Set<string>>(); // TeacherID -> Set<day-period>
  const classBusy = new Map<number, Set<string>>(); // ClassIdx -> Set<day-period>

  teachers.forEach(t => teacherBusy.set(t.id, new Set()));
  for (let i = 0; i < uniqueClasses.length; i++) classBusy.set(i, new Set());

  const csvRows: string[] = ['className,subjectCode,teacherNIP,dayOfWeek,startTime,endTime,room'];
  let totalRows = 0;

  // 5. Generate
  console.log('Generating slots...');

  for (const day of DAYS) {
    for (const period of PERIODS) {
      const slotKey = `${day}-${period}`;

      for (let classIdx = 0; classIdx < uniqueClasses.length; classIdx++) {
        if (classBusy.get(classIdx)?.has(slotKey)) continue;

        const needs = classState.get(classIdx)!;
        const available = Array.from(needs.entries())
          .filter(([_, h]) => h > 0)
          .sort((a, b) => b[1] - a[1]);

        let assigned = false;

        for (const [subj, _] of available) {
          // Find valid teacher
          const rule = assignments.find(a => a.code === subj && (
            a.access === 'all' ||
            (a.access === 'lower' && classIdx < 5) ||
            (a.access === 'upper' && classIdx >= 5)
          ));

          if (!rule) continue;

          const teacherId = teacherMap.get(rule.email);
          if (!teacherId) continue;

          if (!teacherBusy.get(teacherId)?.has(slotKey)) {
            // Found it!
            const nip = teacherNip.get(teacherId);
            const time = TIME_MAP[period];

            csvRows.push(`${uniqueClasses[classIdx].name},${subj},${nip},${day},${time.start},${time.end},Ruang ${uniqueClasses[classIdx].name}`);

            teacherBusy.get(teacherId)?.add(slotKey);
            classBusy.get(classIdx)?.add(slotKey);
            needs.set(subj, needs.get(subj)! - 1);

            totalRows++;
            assigned = true;

            if (uniqueClasses[classIdx].name === 'X-A' && day === 'MONDAY' && period === 1) {
              console.log(`Diagnostic: X-A Mon 1 assigned to ${subj} (${rule.email})`);
            }

            break;
          }
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

generateCsvV2().catch(console.error);
