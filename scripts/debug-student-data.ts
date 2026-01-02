import { prisma } from "../src/lib/prisma";

async function main() {
  const nis = process.argv[2];
  if (!nis) {
    console.log("Please provide NIS");
    return;
  }

  console.log(`Searching for student with NIS: ${nis}`);

  const student = await prisma.student.findUnique({
    where: { nis },
    include: {
      user: true,
      class: true
    }
  });

  if (!student) {
    console.log("Student not found.");
  } else {
    console.log("Student Found:");
    console.log("ID:", student.id);
    console.log("User ID:", student.userId);
    console.log("Name:", student.user.name);
    console.log("BirthDate (Raw):", student.birthDate);
    console.log("BirthDate (ISO):", student.birthDate?.toISOString());
    console.log("Class:", student.class?.name);

    // Test Date Comparison Logic
    if (student.birthDate) {
      const dbDate = student.birthDate.toISOString().split("T")[0];
      console.log("Logic DB Date String:", dbDate);
    }
  }
}

main();
