// src/app/admin/semesters/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminSemestersPage() {
  const programs = await prisma.program.findMany({
    include: {
      semesters: {
        orderBy: { number: "asc" },
        include: { _count: { select: { courses: true, resources: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Semesters</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            View and manage semesters per program
          </p>
        </div>
        <Link href="/admin/semesters/new" className="btn-primary text-sm">
          + Add Semester
        </Link>
      </div>

      {programs.map((prog) => (
        <div key={prog.id}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>
            {prog.name}
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Label</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Courses</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Resources</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prog.semesters.map((sem, i) => (
                  <tr
                    key={sem.id}
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                      backgroundColor: "var(--bg)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}
                      >
                        {sem.number}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>
                      {sem.label}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {sem._count.courses}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {sem._count.resources}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/programs/${prog.slug}/semesters/${sem.number}`}
                        target="_blank"
                        className="btn-ghost text-xs px-2 py-1"
                      >
                        View ↗
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
