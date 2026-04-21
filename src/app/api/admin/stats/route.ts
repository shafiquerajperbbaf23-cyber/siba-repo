// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [
    totalResources,
    totalCourses,
    totalPrograms,
    recentResources,
    byType,
    byProgram,
  ] = await Promise.all([
    prisma.resource.count(),
    prisma.course.count(),
    prisma.program.count(),
    prisma.resource.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        type: true,
        course: { select: { name: true, code: true } },
        semester: { select: { number: true, label: true } },
        program: { select: { name: true, slug: true } },
      },
    }),
    prisma.resourceType.findMany({
      include: { _count: { select: { resources: true } } },
    }),
    prisma.program.findMany({
      include: { _count: { select: { resources: true } } },
    }),
  ]);

  return NextResponse.json({
    totalResources,
    totalCourses,
    totalPrograms,
    recentResources,
    byType: byType.map((t) => ({ name: t.name, count: t._count.resources })),
    byProgram: byProgram.map((p) => ({ name: p.name, count: p._count.resources })),
  });
}
