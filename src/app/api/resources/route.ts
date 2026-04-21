// src/app/api/resources/route.ts
// Line 2-4 — add Prisma import
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";  // ADD THIS
import { z } from "zod";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const q = searchParams.get("q");
  const programSlug = searchParams.get("program");
  const semesterNumber = searchParams.get("semester");
  const typeSlug = searchParams.get("type");
  const courseId = searchParams.get("courseId");

  const where: Prisma.ResourceWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { course: { name: { contains: q, mode: "insensitive" } } },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }
  if (programSlug) where.program = { slug: programSlug };
  if (semesterNumber) where.semester = { number: parseInt(semesterNumber, 10) };
  if (typeSlug) where.type = { slug: typeSlug };
  if (courseId) where.courseId = courseId;

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        type: true,
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, number: true, label: true } },
        program: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
        uploadedBy: { select: { name: true } },
      },
    }),
    prisma.resource.count({ where }),
  ]);

  return NextResponse.json({
    resources,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createResourceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  fileUrl: z.string().url().includes("archive.org"),
  fileSize: z.string().optional(),
  year: z.number().int().min(1990).max(2100).optional(),
  typeId: z.string().cuid(),
  courseId: z.string().cuid(),
  semesterId: z.string().cuid(),
  programId: z.string().cuid(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const result = createResourceSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { tags, ...data } = result.data;

  // Upsert tags
  const tagRecords = await Promise.all(
    (tags ?? []).map((name) => {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      return prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
    })
  );

  const admin = await prisma.adminUser.findUnique({
    where: { email: session!.user!.email! },
  });

  const resource = await prisma.resource.create({
    data: {
      ...data,
      uploadedById: admin!.id,
      tags: {
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: {
      type: true,
      course: { select: { name: true, code: true } },
      semester: { select: { number: true, label: true } },
      program: { select: { name: true, slug: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(resource, { status: 201 });
}
