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
  typeId: z.string().min(1),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
  programId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

const bulkSchema = z.object({
  resources: z.array(bulkItemSchema).min(1).max(100),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();

  // Filter out rows with missing required IDs before validation
  const cleaned = (body.resources ?? []).filter(
    (r: Record<string, unknown>) =>
      r.title &&
      r.fileUrl &&
      r.typeId &&
      r.courseId &&
      r.semesterId &&
      r.programId
  );

  if (cleaned.length === 0) {
    return NextResponse.json(
      { error: "No valid resources found. Check that course codes exist in the database." },
      { status: 400 }
    );
  }

  const result = bulkSchema.safeParse({ resources: cleaned });
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
    { status: errors.length > 0 && created.length === 0 ? 400 : 201 }
  );
}
