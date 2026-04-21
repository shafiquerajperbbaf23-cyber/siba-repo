// src/app/admin/programs/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProgramsPage() {
  const programs = await prisma.program.findMany({
    include: {
      _count: { select: { semesters: true, resources: true } },
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
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Programs</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage academic programs and their structure
          </p>
        </div>
        <Link href="/admin/programs/new" className="btn-primary text-sm">
          + Add Program
        </Link>
      </div>

      <div className="space-y-4">
        {programs.map((prog) => (
          <div key={prog.id} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>{prog.name}</h2>
                  <span className="badge-accent">{prog.slug}</span>
                </div>
                {prog.description && (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{prog.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                  <span>{prog._count.semesters} semesters</span>
                  <span>·</span>
                  <span>{prog._count.resources} resources</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/programs/${prog.slug}`} target="_blank" className="btn-ghost text-xs px-2 py-1">
                  View ↗
                </Link>
                <Link href={`/admin/programs/${prog.id}/edit`} className="btn-ghost text-xs px-2 py-1">
                  Edit
                </Link>
              </div>
            </div>

            {/* Semester grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {prog.semesters.map((sem) => (
                <div
                  key={sem.id}
                  className="rounded-lg p-2 text-center"
                  style={{ backgroundColor: "var(--bg-subtle)" }}
                >
                  <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                    S{sem.number}
                  </div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: "var(--text-subtle)" }}>
                    {sem._count.courses}c
                  </div>
                  <div className="text-xs font-mono" style={{ color: "var(--accent)" }}>
                    {sem._count.resources}r
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
