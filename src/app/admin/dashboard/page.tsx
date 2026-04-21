// src/app/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { ResourceTypeBadge } from "@/components/ui/ResourceTypeBadge";
import Link from "next/link";

async function getDashboardData() {
  const [
    totalResources,
    totalCourses,
    totalPrograms,
    recentResources,
    byType,
    byProgram,
  ] = await Promise.all([
    prisma.resource.count(),
    prisma.course.count(),
    prisma.program.count(),
    prisma.resource.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        type: true,
        course: { select: { name: true, code: true } },
        semester: { select: { label: true } },
        program: { select: { name: true, slug: true } },
      },
    }),
    prisma.resourceType.findMany({
      include: { _count: { select: { resources: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.program.findMany({
      include: {
        _count: { select: { resources: true } },
        semesters: {
          include: { _count: { select: { resources: true } } },
          orderBy: { number: "asc" },
        },
      },
    }),
  ]);

  return { totalResources, totalCourses, totalPrograms, recentResources, byType, byProgram };
}

export default async function DashboardPage() {
  const {
    totalResources,
    totalCourses,
    totalPrograms,
    recentResources,
    byType,
    byProgram,
  } = await getDashboardData();

  const maxTypeCount = Math.max(...byType.map((t) => t._count.resources), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Repository overview and content statistics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Resources", value: totalResources, icon: "📄", href: "/admin/resources" },
          { label: "Total Courses", value: totalCourses, icon: "📚", href: "/admin/courses" },
          { label: "Programs", value: totalPrograms, icon: "🎓", href: "/admin/programs" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-5 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 opacity-0 group-hover:opacity-100"
                style={{ color: "var(--text-subtle)" }}
              >
                <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
            <div className="text-3xl font-bold font-display" style={{ color: "var(--text)" }}>
              {stat.value}
            </div>
            <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource types bar chart */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>
            Resources by Type
          </h2>
          <div className="space-y-3">
            {byType.map((t) => (
              <div key={t.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ResourceTypeBadge slug={t.slug} name={t.name} size="sm" />
                  </div>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {t._count.resources}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--bg-muted)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(t._count.resources / maxTypeCount) * 100}%`,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By program + semester */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>
            Resources by Program
          </h2>
          <div className="space-y-4">
            {byProgram.map((prog) => (
              <div key={prog.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                    {prog.name}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {prog._count.resources} total
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {prog.semesters.slice(0, 8).map((sem) => (
                    <div
                      key={sem.id}
                      className="rounded-md px-2 py-1.5 text-center"
                      style={{ backgroundColor: "var(--bg-muted)" }}
                    >
                      <div className="text-xs font-mono font-semibold" style={{ color: "var(--text)" }}>
                        {sem._count.resources}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                        S{sem.number}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent resources */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>
            Recently Added
          </h2>
          <Link href="/admin/resources" className="text-xs btn-ghost px-2 py-1">
            View all →
          </Link>
        </div>

        <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Title</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Course</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>Program</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentResources.map((res, i) => (
                <tr
                  key={res.id}
                  style={{
                    borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    backgroundColor: "var(--bg)",
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm truncate max-w-[200px]" style={{ color: "var(--text)" }}>
                      {res.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <ResourceTypeBadge slug={res.type.slug} name={res.type.name} size="sm" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {res.course.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="badge">{res.program.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs px-2 py-1"
                      >
                        View ↗
                      </a>
                      <Link
                        href={`/admin/resources/${res.id}/edit`}
                        className="btn-ghost text-xs px-2 py-1"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
