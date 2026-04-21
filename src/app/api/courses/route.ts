// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get("semesterId");
  const programSlug = searchParams.get("program");

  const courses = await prisma.course.findMany({
    where: {
      ...(semesterId ? { semesterId } : {}),
      ...(programSlug ? { semester: { program: { slug: programSlug } } } : {}),
    },
    include: {
      semester: {
        select: {
          number: true,
          label: true,
          program: { select: { name: true, slug: true } },
        },
      },
      _count: { select: { resources: true } },
    },
    orderBy: [{ semester: { number: "asc" } }, { code: "asc" }],
  });

  return NextResponse.json(courses);
}
