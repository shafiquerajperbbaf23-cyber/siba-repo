// src/app/programs/[slug]/semesters/[number]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface Props {
  params: { slug: string; number: string };
}

async function getSemesterData(programSlug: string, semNumber: number) {
  const program = await prisma.program.findUnique({ where: { slug: programSlug } });
  if (!program) return null;

  const semester = await prisma.semester.findUnique({
    where: { programId_number: { programId: program.id, number: semNumber } },
    include: {
      program: true,
      courses: {
        orderBy: { code: "asc" },
        include: { _count: { select: { resources: true } } },
      },
      _count: { select: { resources: true } },
    },
  });
  return semester;
}

export default async function SemesterPage({ params }: Props) {
  const semNum = parseInt(params.number, 10);
  if (isNaN(semNum)) notFound();

  const semester = await getSemesterData(params.slug, semNum);
  if (!semester) notFound();

  const RESOURCE_TYPE_ORDER = ["notes", "slides", "books", "past-papers", "assignments", "miscellaneous"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: semester.program.name, href: `/programs/${semester.program.slug}` },
            { label: semester.label },
          ]}
        />

        <div className="mt-6 mb-10">
          <h1 className="section-title">
            {semester.program.name} — {semester.label}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            {semester.courses.length} courses · {semester._count.resources} total resources
          </p>
        </div>

        {/* Courses */}
        <div className="space-y-3">
          {semester.courses.map((course, i) => (
            <Link
              key={course.id}
              href={`/programs/${params.slug}/semesters/${params.number}/courses/${course.id}`}
              className={`card flex items-center gap-4 p-5 group animate-fade-up stagger-${Math.min(i + 1, 6)}`}
            >
              {/* Course code pill */}
              <div
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold"
                style={{ backgroundColor: "var(--bg-muted)", color: "var(--accent)" }}
              >
                {course.code}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: "var(--text)" }}>
                  {course.name}
                </div>
                {course.instructor && (
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                    {course.instructor}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                  {course._count.resources} resources
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform group-hover:translate-x-1"
                  style={{ color: "var(--text-subtle)" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}

          {semester.courses.length === 0 && (
            <div
              className="card p-10 text-center"
              style={{ color: "var(--text-subtle)" }}
            >
              No courses added yet for this semester.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
