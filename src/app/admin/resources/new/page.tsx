// src/app/admin/resources/new/page.tsx
import { prisma } from "@/lib/prisma";
import { ResourceForm } from "@/components/admin/ResourceForm";

async function getFormData() {
  const [programs, semesters, courses, resourceTypes] = await Promise.all([
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
  return { programs, semesters, courses, resourceTypes };
}

export default async function NewResourcePage() {
  const { programs, semesters, courses, resourceTypes } = await getFormData();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Add Resource</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Upload a new resource linked to a course. File must be hosted on Archive.org.
        </p>
      </div>
      <div className="card p-6">
        <ResourceForm
          mode="create"
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
        />
      </div>
    </div>
  );
}
