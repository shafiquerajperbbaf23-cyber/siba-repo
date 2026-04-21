// src/app/api/programs/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const programs = await prisma.program.findMany({
    include: {
      _count: { select: { semesters: true, resources: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(programs);
}
