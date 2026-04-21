// src/app/programs/[slug]/semesters/[number]/courses/[courseId]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ResourceTypeBadge } from "@/components/ui/ResourceTypeBadge";

interface Props {
  params: { slug: string; number: string; courseId: string };
}

async function getCourseData(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      semester: {
        include: { program: true },
      },
      resources: {
        orderBy: { createdAt: "desc" },
        include: {
          type: true,
          tags: { include: { tag: true } },
        },
      },
    },
  });
}

// Group resources by type
type CourseWithResources = NonNullable<Awaited<ReturnType<typeof getCourseData>>>;
function groupByType(resources: CourseWithResources["resources"]) {
  const order = ["notes", "slides", "books", "past-papers", "assignments", "miscellaneous"];
  const groups: Record<string, typeof resources> = {};
  for (const r of resources) {
    const key = r.type.slug;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return order
    .filter((slug) => groups[slug]?.length)
    .map((slug) => ({ slug, type: groups[slug][0].type, items: groups[slug] }));
}

export default async function CoursePage({ params }: Props) {
  const course = await getCourseData(params.courseId);
  if (!course) notFound();

  const { semester } = course;
  const program = semester.program;
  const grouped = groupByType(course.resources);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: program.name, href: `/programs/${program.slug}` },
            {
              label: semester.label,
              href: `/programs/${program.slug}/semesters/${semester.number}`,
            },
            { label: course.code },
          ]}
        />

        {/* Course header */}
        <div className="mt-6 mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="px-3 py-1 rounded-lg text-sm font-mono font-semibold"
              style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}
            >
              {course.code}
            </span>
            <span className="badge">{semester.label}</span>
            <span className="badge">{program.name}</span>
          </div>
          <h1 className="section-title">{course.name}</h1>
          {course.instructor && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Instructor: {course.instructor}
            </p>
          )}
          {course.description && (
            <p className="mt-2 text-sm leading-relaxed max-w-2xl" style={{ color: "var(--text-muted)" }}>
              {course.description}
            </p>
          )}
          <p className="mt-2 text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
            {course.resources.length} resources available
          </p>
        </div>

        {/* Resources grouped by type */}
        {grouped.length === 0 ? (
          <div className="card p-10 text-center" style={{ color: "var(--text-subtle)" }}>
            No resources added yet for this course.
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ slug, type, items }) => (
              <div key={slug}>
                <div className="flex items-center gap-2 mb-3">
                  <ResourceTypeBadge slug={type.slug} name={type.name} />
                  <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                    {items.length} file{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                          Title
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>
                          Year
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold hidden md:table-cell" style={{ color: "var(--text-muted)" }}>
                          Size
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>
                          Tags
                        </th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((resource, i) => (
                        <tr
                          key={resource.id}
                          className="group"
                          style={{
                            borderTop: i > 0 ? "1px solid var(--border)" : "none",
                            backgroundColor: "var(--bg)",
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium" style={{ color: "var(--text)" }}>
                              {resource.title}
                            </div>
                            {resource.description && (
                              <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-subtle)" }}>
                                {resource.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>
                            {resource.year ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono hidden md:table-cell" style={{ color: "var(--text-muted)" }}>
                            {resource.fileSize ?? "—"}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.map(({ tag }) => (
                                <span key={tag.id} className="badge">{tag.name}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={resource.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Download ↗
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
