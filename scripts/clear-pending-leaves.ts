import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function clearPendingLeaves() {
  try {
    const result = await prisma.leaveRequest.deleteMany({
      where: {
        status: 'PENDING',
      },
    });

    console.log(`✅ Deleted ${result.count} pending leave requests`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearPendingLeaves();
