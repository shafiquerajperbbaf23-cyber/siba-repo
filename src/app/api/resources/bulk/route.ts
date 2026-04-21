// src/app/api/resources/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { z } from "zod";

const bulkItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileSize: z.string().optional(),
  year: z.number().int().optional(),
  typeId: z.string().cuid(),
  courseId: z.string().cuid(),
  semesterId: z.string().cuid(),
  programId: z.string().cuid(),
  tags: z.array(z.string()).optional(),
});

const bulkSchema = z.object({
  resources: z.array(bulkItemSchema).min(1).max(100),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const result = bulkSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: session!.user!.email! },
  });

  const created: string[] = [];
  const errors: { index: number; error: string }[] = [];

  for (let i = 0; i < result.data.resources.length; i++) {
    const { tags, ...data } = result.data.resources[i];
    try {
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

      const resource = await prisma.resource.create({
        data: {
          ...data,
          uploadedById: admin!.id,
          tags: { create: tagRecords.map((tag) => ({ tagId: tag.id })) },
        },
      });

      created.push(resource.id);
    } catch (err) {
      errors.push({ index: i, error: String(err) });
    }
  }

  return NextResponse.json(
    { created: created.length, errors },
    { status: errors.length > 0 ? 207 : 201 }
  );
}
