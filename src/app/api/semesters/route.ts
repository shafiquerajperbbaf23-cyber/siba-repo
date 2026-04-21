// src/app/api/semesters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const programSlug = searchParams.get("program");

  const semesters = await prisma.semester.findMany({
    where: programSlug ? { program: { slug: programSlug } } : undefined,
    include: {
      program: { select: { name: true, slug: true } },
      _count: { select: { courses: true, resources: true } },
    },
    orderBy: [{ program: { name: "asc" } }, { number: "asc" }],
  });

  return NextResponse.json(semesters);
}
