import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function clearData() {
  console.log('🗑️  Starting data cleanup...\n');

  try {
    // Delete in correct order (respecting foreign key constraints)
    console.log('Deleting student attendances...');
    await prisma.studentAttendance.deleteMany({});

    console.log('Deleting teacher attendances...');
    await prisma.teacherAttendance.deleteMany({});

    console.log('Deleting leave requests...');
    await prisma.leaveRequest.deleteMany({});

    console.log('Deleting teacher leave requests...');
    await prisma.teacherLeaveRequest.deleteMany({});

    console.log('Deleting schedules...');
    await prisma.schedule.deleteMany({});

    console.log('Deleting students...');
    await prisma.student.deleteMany({});

    console.log('Deleting classes...');
    await prisma.class.deleteMany({});

    console.log('Deleting teachers...');
    await prisma.teacher.deleteMany({});

    console.log('Deleting subjects...');
    await prisma.subject.deleteMany({});

    console.log('Deleting academic years...');
    await prisma.academicYear.deleteMany({});

    console.log('Deleting notifications...');
    await prisma.notification.deleteMany({});

    console.log('Deleting audit logs...');
    await prisma.auditLog.deleteMany({});

    // Delete users except admin and principal
    console.log('Deleting users (keeping admin/principal)...');
    await prisma.user.deleteMany({
      where: {
        role: {
          notIn: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'],
        },
      },
    });

    console.log('\n✅ Data cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
