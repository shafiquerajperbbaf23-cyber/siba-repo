import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const resourceTypes = [
    { name: "Notes", slug: "notes", icon: "FileText" },
    { name: "Slides", slug: "slides", icon: "Presentation" },
    { name: "Books", slug: "books", icon: "BookOpen" },
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
  console.log("✅ Resource types seeded");

  const bba = await prisma.program.upsert({
    where: { slug: "bba" },
    update: {},
    create: {
      name: "BBA",
      slug: "bba",
      description: "Bachelor of Business Administration — A comprehensive 4-year undergraduate program covering core business disciplines.",
    },
  });

  const thp = await prisma.program.upsert({
    where: { slug: "thp" },
    update: {},
    create: {
      name: "THP",
      slug: "thp",
      description: "Talent Hunt Program — A specialized accelerated program for high-achieving students.",
    },
  });

  console.log("✅ Programs seeded");

  type CourseEntry = { name: string; code: string; instructor?: string };

  const bbaCourses: Record<number, CourseEntry[]> = {
    1: [
      { name: "Computer Applications in Business", code: "CABS-101" },
      { name: "College Algebra", code: "MATH-101" },
      { name: "Functional English", code: "ENG-101" },
      { name: "Human Behavior", code: "HB-101" },
      { name: "Islamic Studies", code: "ISL-101" },
      { name: "Microeconomics", code: "ECON-101" },
      { name: "Pakistan Studies", code: "PS-101" },
    ],
    2: [
      { name: "Principles of Accounting", code: "ACC-201" },
      { name: "Creative Writing", code: "ENG-201" },
      { name: "Macroeconomics", code: "ECON-201" },
      { name: "Social Psychology", code: "PSY-201" },
      { name: "Business Statistics", code: "STAT-201" },
      { name: "Urdu", code: "URDU-201" },
    ],
    3: [
      { name: "Introduction to Business Finance", code: "FIN-301" },
      { name: "Business Mathematics", code: "MATH-301" },
      { name: "Corporate Accounting", code: "ACC-301" },
      { name: "International Relations", code: "IR-301" },
      { name: "Principles of Management", code: "MGT-301" },
      { name: "Principles of Marketing", code: "MKT-301" },
    ],
    4: [
      { name: "Business Calculus", code: "MATH-401" },
      { name: "Business Communication", code: "BC-401" },
      { name: "Development Economics", code: "ECON-401" },
      { name: "E-Commerce", code: "IT-401" },
      { name: "Financial Institutions Management", code: "FIN-401" },
      { name: "Organizational Behaviour", code: "MGT-402" },
      { name: "Introduction to Programming", code: "IT-402" },
    ],
    5: [
      { name: "Inferential Statistics", code: "STAT-501" },
      { name: "Business Law", code: "LAW-501" },
      { name: "Human Resource Management", code: "HRM-501" },
      { name: "Financial Management", code: "FIN-501" },
      { name: "Strategic Management", code: "MGT-501" },
      { name: "Entrepreneurship", code: "ENT-501" },
    ],
    6: [
      { name: "Business Research Methods", code: "BRM-601" },
      { name: "Business Ethics", code: "ETH-601" },
      { name: "Consumer Behavior", code: "MKT-601" },
      { name: "Corporate Social Responsibility", code: "CSR-601" },
      { name: "Financial Reporting and Analysis", code: "ACC-601" },
      { name: "Managerial Accounting", code: "ACC-602" },
      { name: "Operations Management", code: "MGT-601" },
      { name: "Specialization HRM", code: "HRM-601" },
      { name: "Specialization Consumer Behavior", code: "MKT-602" },
    ],
    7: [
      { name: "Supply Chain Management", code: "MGT-701" },
      { name: "Investment Analysis", code: "FIN-701" },
      { name: "International Business", code: "IB-701" },
      { name: "Taxation", code: "TAX-701" },
      { name: "Project Management", code: "MGT-702" },
      { name: "Digital Marketing", code: "MKT-701" },
    ],
    8: [
      { name: "Business Policy and Strategy", code: "MGT-801" },
      { name: "Research Project", code: "RP-801" },
      { name: "Internship Report", code: "INT-801" },
      { name: "Elective I", code: "ELEC-801" },
      { name: "Elective II", code: "ELEC-802" },
    ],
  };

  for (let semNum = 1; semNum <= 8; semNum++) {
    const semester = await prisma.semester.upsert({
      where: { programId_number: { programId: bba.id, number: semNum } },
      update: {},
      create: {
        number: semNum,
        label: `Semester ${semNum}`,
        programId: bba.id,
      },
    });

    const courses = bbaCourses[semNum] ?? [];
    for (const course of courses) {
      await prisma.course.upsert({
        where: { semesterId_code: { semesterId: semester.id, code: course.code } },
        update: { name: course.name },
        create: {
          name: course.name,
          code: course.code,
          instructor: course.instructor,
          semesterId: semester.id,
        },
      });
    }
    console.log(`✅ BBA Semester ${semNum}: ${courses.length} courses`);
  }

  type THP = { name: string; code: string };

  const thpCourses: Record<number, THP[]> = {
    1: [
      { name: "Introduction to Business", code: "THP-BUS-101" },
      { name: "English Communication", code: "THP-ENG-101" },
      { name: "Mathematics", code: "THP-MATH-101" },
      { name: "Computer Skills", code: "THP-IT-101" },
    ],
    2: [
      { name: "Accounting Fundamentals", code: "THP-ACC-201" },
      { name: "Economics", code: "THP-ECON-201" },
      { name: "Management Principles", code: "THP-MGT-201" },
      { name: "Business Statistics", code: "THP-STAT-201" },
    ],
    3: [
      { name: "Marketing Management", code: "THP-MKT-301" },
      { name: "Financial Management", code: "THP-FIN-301" },
      { name: "Organizational Behavior", code: "THP-MGT-301" },
      { name: "Business Research", code: "THP-BRM-301" },
    ],
    4: [
      { name: "Strategic Management", code: "THP-MGT-401" },
      { name: "Entrepreneurship", code: "THP-ENT-401" },
      { name: "Project Work", code: "THP-RP-401" },
      { name: "Business Ethics", code: "THP-ETH-401" },
    ],
  };

  for (let semNum = 1; semNum <= 4; semNum++) {
    const semester = await prisma.semester.upsert({
      where: { programId_number: { programId: thp.id, number: semNum } },
      update: {},
      create: {
        number: semNum,
        label: `Semester ${semNum}`,
        programId: thp.id,
      },
    });

    const courses = thpCourses[semNum] ?? [];
    for (const course of courses) {
      await prisma.course.upsert({
        where: { semesterId_code: { semesterId: semester.id, code: course.code } },
        update: { name: course.name },
        create: {
          name: course.name,
          code: course.code,
          semesterId: semester.id,
        },
      });
    }
    console.log(`✅ THP Semester ${semNum}: ${courses.length} courses`);
  }

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

  console.log("✅ Admin user seeded");
  console.log("\n🎉 Full seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
