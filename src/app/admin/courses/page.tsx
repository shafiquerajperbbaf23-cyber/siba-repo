// src/app/admin/courses/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      semester: {
        include: { program: { select: { name: true, slug: true } } },
      },
      _count: { select: { resources: true } },
    },
    orderBy: [{ semester: { program: { name: "asc" } } }, { semester: { number: "asc" } }, { code: "asc" }],
  });

  // Group by program
  const grouped: Record<string, typeof courses> = {};
  for (const c of courses) {
    const key = c.semester.program.name;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Courses</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {courses.length} courses across all programs
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary text-sm">
          + Add Course
        </Link>
      </div>

      {Object.entries(grouped).map(([programName, programCourses]) => (
        <div key={programName}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>
            {programName}
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Semester</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>Instructor</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Resources</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programCourses.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                      backgroundColor: "var(--bg)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold" style={{ color: "var(--accent)" }}>
                        {c.code}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text)" }}>{c.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge">{c.semester.label}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: "var(--text-muted)" }}>
                      {c.instructor ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {c._count.resources}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/courses/${c.id}/edit`} className="btn-ghost text-xs px-2 py-1">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
