// src/app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/public/SearchBar";
import { ResourceTypeBadge } from "@/components/ui/ResourceTypeBadge";
export const dynamic = "force-dynamic";

async function getHomeData() {
  const [programs, recentResources, counts] = await Promise.all([
    prisma.program.findMany({
      include: { _count: { select: { semesters: true, resources: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.resource.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        type: true,
        course: { select: { name: true, code: true } },
        semester: { select: { number: true, label: true } },
        program: { select: { name: true, slug: true } },
      },
    }),
    prisma.resource.count(),
  ]);
  return { programs, recentResources, counts };
}

export default async function HomePage() {
  const { programs, recentResources, counts } = await getHomeData();

  const resourceTypes = [
    { name: "Notes", slug: "notes", icon: "📄" },
    { name: "Slides", slug: "slides", icon: "🖼️" },
    { name: "Books", slug: "books", icon: "📚" },
    { name: "Past Papers", slug: "past-papers", icon: "📝" },
    { name: "Assignments", slug: "assignments", icon: "📋" },
    { name: "Miscellaneous", slug: "miscellaneous", icon: "📦" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--accent) 20%, transparent), transparent)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="badge-accent mb-4 animate-fade-up">
              🎓 Academic Repository — Pilot Phase
            </div>
            <h1
              className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 animate-fade-up stagger-1"
              style={{ color: "var(--text)", lineHeight: 1.1 }}
            >
              SIBA Academic
              <br />
              <em>Repository</em>
            </h1>
            <p
              className="text-lg md:text-xl mb-8 leading-relaxed animate-fade-up stagger-2"
              style={{ color: "var(--text-muted)", maxWidth: "540px" }}
            >
              Access notes, slides, books, past papers, and assignments for BBA
              and THP programs — structured, searchable, and always available.
            </p>
            <div className="max-w-xl animate-fade-up stagger-3">
              <SearchBar />
            </div>
            <div
              className="flex items-center gap-6 mt-8 text-sm animate-fade-up stagger-4"
              style={{ color: "var(--text-subtle)" }}
            >
              <span>
                <strong style={{ color: "var(--text)" }}>{counts}</strong> resources
              </span>
              <span>
                <strong style={{ color: "var(--text)" }}>{programs.length}</strong> programs
              </span>
              <span>
                <strong style={{ color: "var(--text)" }}>6</strong> resource types
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Programs</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Select a program to browse by semester and course
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((program, i) => (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              className={`card p-6 group animate-fade-up stagger-${i + 1}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}
                >
                  {program.name.slice(0, 2)}
                </div>
                <svg
                  width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "var(--text-subtle)" }}
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>
                {program.name}
              </h3>
              {program.description && (
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                  {program.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                <span>{program._count.semesters} semesters</span>
                <span>·</span>
                <span>{program._count.resources} resources</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Resource Types */}
      <section className="border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--text-muted)" }}>
            Resource Types Available
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {resourceTypes.map((rt) => (
              <Link
                key={rt.slug}
                href={`/search?type=${rt.slug}`}
                className="card p-4 text-center group hover:border-[var(--accent)]"
              >
                <div className="text-2xl mb-2">{rt.icon}</div>
                <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {rt.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Resources */}
      {recentResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Recently Added</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Latest resources uploaded to the repository
              </p>
            </div>
            <Link href="/search" className="btn-ghost text-sm">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentResources.map((res) => (
              <a
                key={res.id}
                href={res.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex items-center gap-4 p-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <ResourceTypeBadge slug={res.type.slug} name={res.type.name} size="sm" />
                    <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                      {res.program.name} · {res.semester.label}
                    </span>
                  </div>
                  <div className="font-medium truncate" style={{ color: "var(--text)" }}>
                    {res.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                    {res.course.code} — {res.course.name}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {res.fileSize && (
                    <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                      {res.fileSize}
                    </span>
                  )}
                  <span className="btn-ghost text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Download ↗
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Pilot Phase Banner */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div
            className="rounded-2xl p-6 md:p-8 border"
            style={{
              backgroundColor: "var(--accent-subtle)",
              borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--accent)" }}>
                  Pilot Phase
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="text-sm leading-relaxed">
                  This repository is currently in a pilot phase focused on <strong>BBA</strong> and{" "}
                  <strong>THP</strong>. It will be expanded into a comprehensive academic repository
                  covering all programs, departments, and academic resources across the institution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm" style={{ color: "var(--text-subtle)" }}>
              © {new Date().getFullYear()} SIBA Academic Repository. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-subtle)" }}>
              <Link href="/programs/bba" className="hover:text-[var(--text)] transition-colors">BBA</Link>
              <Link href="/programs/thp" className="hover:text-[var(--text)] transition-colors">THP</Link>
              <Link href="/search" className="hover:text-[var(--text)] transition-colors">Search</Link>
              <Link href="/admin/login" className="hover:text-[var(--text)] transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
