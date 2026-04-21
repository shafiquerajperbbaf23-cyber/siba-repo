// src/app/api/courses/all/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Used by bulk upload for client-side ID resolution
export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      semester: {
        select: {
          id: true,
          number: true,
          programId: true,
          program: { select: { id: true, slug: true } },
        },
      },
    },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(courses);
}
