// src/app/api/resources/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url().optional(),
  fileSize: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  typeId: z.string().cuid().optional(),
  courseId: z.string().cuid().optional(),
  semesterId: z.string().cuid().optional(),
  programId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { tags, ...data } = result.data;

  // Handle tag updates
  let tagOps = {};
  if (tags !== undefined) {
    const tagRecords = await Promise.all(
      tags.map((name) => {
        const slug = name.toLowerCase().replace(/\s+/g, "-");
        return prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      })
    );
    await prisma.resourceTag.deleteMany({ where: { resourceId: params.id } });
    tagOps = {
      tags: {
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    };
  }

  const resource = await prisma.resource.update({
    where: { id: params.id },
    data: { ...data, ...tagOps },
    include: {
      type: true,
      course: { select: { name: true, code: true } },
      semester: { select: { number: true, label: true } },
      program: { select: { name: true, slug: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(resource);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await prisma.resource.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
    include: {
      type: true,
      course: { select: { id: true, name: true, code: true } },
      semester: { select: { id: true, number: true, label: true } },
      program: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
      uploadedBy: { select: { name: true } },
    },
  });

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(resource);
}
