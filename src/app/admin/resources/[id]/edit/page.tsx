// src/app/admin/resources/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";

interface Props { params: { id: string } }

export default async function EditResourcePage({ params }: Props) {
  const [resource, programs, semesters, courses, resourceTypes] = await Promise.all([
    prisma.resource.findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.program.findMany({ orderBy: { name: "asc" } }),
    prisma.semester.findMany({
      include: { program: { select: { id: true } } },
      orderBy: [{ program: { name: "asc" } }, { number: "asc" }],
    }),
    prisma.course.findMany({
      include: {
        semester: { select: { id: true, label: true, programId: true, program: { select: { name: true } } } },
      },
      orderBy: [{ semester: { number: "asc" } }, { code: "asc" }],
    }),
    prisma.resourceType.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!resource) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Edit Resource</h1>
        <p className="text-sm mt-1 truncate" style={{ color: "var(--text-muted)" }}>{resource.title}</p>
      </div>
      <div className="card p-6">
        <ResourceForm
          mode="edit"
          resourceId={resource.id}
          programs={programs.map((p) => ({ id: p.id, label: p.name }))}
          semesters={semesters.map((s) => ({
            id: s.id,
            label: s.label,
            number: s.number,
            programId: s.program.id,
          }))}
          courses={courses.map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            semesterId: c.semesterId,
            semesterLabel: c.semester.label,
            programId: c.semester.programId,
            programName: c.semester.program.name,
          }))}
          resourceTypes={resourceTypes.map((t) => ({ id: t.id, label: t.name }))}
          defaultValues={{
            title: resource.title,
            description: resource.description ?? "",
            fileUrl: resource.fileUrl,
            fileSize: resource.fileSize ?? "",
            year: resource.year ?? undefined,
            typeId: resource.typeId,
            courseId: resource.courseId,
            semesterId: resource.semesterId,
            programId: resource.programId,
            tags: resource.tags.map((t) => t.tag.name).join(", "),
          }}
        />
      </div>
    </div>
  );
}
