// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Resource Types
  const resourceTypes = [
    { name: "Notes", slug: "notes", icon: "FileText" },
    { name: "Slides", slug: "slides", icon: "Presentation" },
    { name: "Books", slug: "books", icon: "BookOpen" },
    { name: "Past Papers", slug: "past-papers", icon: "ScrollText" },
    { name: "Assignments", slug: "assignments", icon: "ClipboardList" },
    { name: "Miscellaneous", slug: "miscellaneous", icon: "Package" },
  ];

  for (const rt of resourceTypes) {
    await prisma.resourceType.upsert({
      where: { slug: rt.slug },
      update: {},
      create: rt,
    });
  }

  // Programs
  const bba = await prisma.program.upsert({
    where: { slug: "bba" },
    update: {},
    create: {
      name: "BBA",
      slug: "bba",
      description:
        "Bachelor of Business Administration — A comprehensive 4-year undergraduate program covering core business disciplines.",
    },
  });

  const thp = await prisma.program.upsert({
    where: { slug: "thp" },
    update: {},
    create: {
      name: "THP",
      slug: "thp",
      description:
        "Talent Hunt Program — A specialized accelerated program for high-achieving students.",
    },
  });

  // BBA Semesters (8 total)
  const bbaSemesters: { number: number; label: string }[] = [];
  for (let i = 1; i <= 8; i++) {
    const sem = await prisma.semester.upsert({
      where: { programId_number: { programId: bba.id, number: i } },
      update: {},
      create: {
        number: i,
        label: `Semester ${i}`,
        programId: bba.id,
      },
    });
    bbaSemesters.push({ number: i, label: sem.label });
  }

  // BBA Semester 1 Courses (sample)
  const sem1 = await prisma.semester.findFirst({
    where: { programId: bba.id, number: 1 },
  });

  if (sem1) {
    const sem1Courses = [
      {
        name: "Introduction to Business",
        code: "BUS-101",
        instructor: "Dr. Ahmed Raza",
      },
      {
        name: "Principles of Management",
        code: "MGT-101",
        instructor: "Prof. Sara Khan",
      },
      {
        name: "Financial Accounting I",
        code: "ACC-101",
        instructor: "Dr. Hamid Ali",
      },
      {
        name: "Business Mathematics",
        code: "MATH-101",
        instructor: "Prof. Nadia Iqbal",
      },
      {
        name: "English Communication Skills",
        code: "ENG-101",
        instructor: "Ms. Aisha Malik",
      },
      {
        name: "Computer Applications in Business",
        code: "IT-101",
        instructor: "Mr. Usman Tariq",
      },
    ];

    for (const course of sem1Courses) {
      await prisma.course.upsert({
        where: { semesterId_code: { semesterId: sem1.id, code: course.code } },
        update: {},
        create: { ...course, semesterId: sem1.id },
      });
    }
  }

  // THP Semesters (4 typical)
  for (let i = 1; i <= 4; i++) {
    await prisma.semester.upsert({
      where: { programId_number: { programId: thp.id, number: i } },
      update: {},
      create: {
        number: i,
        label: `Semester ${i}`,
        programId: thp.id,
      },
    });
  }

  // Admin User
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_SEED_PASSWORD || "Admin@SIBA2024",
    12
  );

  await prisma.adminUser.upsert({
    where: { email: "admin@siba.edu.pk" },
    update: {},
    create: {
      email: "admin@siba.edu.pk",
      name: "SIBA Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
