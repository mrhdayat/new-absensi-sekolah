import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function diagnose() {
  console.log('🔍 DIAGNOSIS START\n');

  // 1. Check for Duplicate Classes
  const classes = await prisma.class.findMany();
  const classNames = new Map<string, number>();
  classes.forEach(c => {
    classNames.set(c.name, (classNames.get(c.name) || 0) + 1);
  });

  const duplicateClasses = Array.from(classNames.entries()).filter(([_, c]) => c > 1);
  if (duplicateClasses.length > 0) {
    console.log('❌ FATAL: Duplicate Classes found!');
    console.log(duplicateClasses);
  } else {
    console.log('✅ Class names are unique.');
  }

  // 2. Check DB Schedules for Conflicts
  const schedules = await prisma.schedule.findMany({
    include: { class: true, teacher: true, subject: true }
  });
  console.log(`\n📊 DB Schedules Count: ${schedules.length}`);

  // Check Dates
  const years = new Set(schedules.map(s => s.startTime.getFullYear()));
  console.log(`📅 Schedule Years: ${Array.from(years).join(', ')}`);

  // Check conflicts
  const slotMap = new Map<string, any[]>();
  let dbConflicts = 0;

  schedules.forEach(s => {
    // Key: ClassID-Day-Time
    const timeStr = s.startTime.toTimeString().substring(0, 5);
    const key = `${s.class.name}-${s.dayOfWeek}-${timeStr}`;
    if (!slotMap.has(key)) slotMap.set(key, []);
    slotMap.get(key)!.push(s);
  });

  for (const [key, list] of slotMap.entries()) {
    if (list.length > 1) {
      console.log(`❌ DB CONFLICT: ${key}`);
      list.forEach(s => console.log(`   - ${s.subject.name} (Teacher: ${s.teacher.user.name})`));
      dbConflicts++;
    }
  }

  if (dbConflicts === 0) console.log('✅ No conflicts found in DB.');
  else console.log(`❌ Found ${dbConflicts} conflicts in DB.`);


  // 3. Check CSV Content
  const csvPath = path.join(process.cwd(), 'public', 'schedules.csv');
  if (fs.existsSync(csvPath)) {
    console.log(`\n📄 Checking CSV: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    // Header
    const dataRows = lines.slice(1);

    const csvConflicts = new Map<string, any[]>();
    let csvBad = 0;

    dataRows.forEach((line, idx) => {
      // className,subjectCode,teacherNIP,dayOfWeek,startTime,endTime,room
      const cols = line.split(',');
      const className = cols[0];
      const day = cols[3];
      const start = cols[4];

      const key = `${className}-${day}-${start}`;
      if (!csvConflicts.has(key)) csvConflicts.set(key, []);
      csvConflicts.get(key)!.push({ line: idx + 2, content: line });
    });

    for (const [key, list] of csvConflicts.entries()) {
      if (list.length > 1) {
        console.log(`❌ CSV CONFLICT: ${key}`);
        list.forEach(l => console.log(`   Line ${l.line}: ${l.content}`));
        csvBad++;
      }
    }

    if (csvBad === 0) console.log('✅ No conflicts found in CSV.');
    else console.log(`❌ Found ${csvBad} conflicts in CSV.`);

  } else {
    console.log('⚠️ CSV file not found.');
  }

  await prisma.$disconnect();
}

diagnose().catch(console.error);
