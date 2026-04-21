// src/app/programs/[slug]/page.tsx
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SearchBar } from "@/components/public/SearchBar";

interface Props {
  params: { slug: string };
}

async function getProgramData(slug: string) {
  const program = await prisma.program.findUnique({
    where: { slug },
    include: {
      semesters: {
        orderBy: { number: "asc" },
        include: {
          _count: { select: { courses: true, resources: true } },
        },
      },
      _count: { select: { resources: true } },
    },
  });
  return program;
}

export async function generateMetadata({ params }: Props) {
  const program = await getProgramData(params.slug);
  if (!program) return {};
  return { title: program.name, description: program.description };
}

export default async function ProgramPage({ params }: Props) {
  const program = await getProgramData(params.slug);
  if (!program) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          crumbs={[{ label: "Home", href: "/" }, { label: program.name }]}
        />

        {/* Header */}
        <div className="mt-6 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4"
              style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}
            >
              {program.name.slice(0, 2)}
            </div>
            <h1 className="section-title">{program.name}</h1>
            {program.description && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {program.description}
              </p>
            )}
            <div className="flex gap-4 mt-3 text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
              <span>{program.semesters.length} semesters</span>
              <span>·</span>
              <span>{program._count.resources} resources</span>
            </div>
          </div>
          <div className="w-full md:w-64">
            <SearchBar
              placeholder={`Search in ${program.name}…`}
              size="sm"
            />
          </div>
        </div>

        {/* Semesters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {program.semesters.map((sem, i) => (
            <Link
              key={sem.id}
              href={`/programs/${program.slug}/semesters/${sem.number}`}
              className={`card p-5 group animate-fade-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-3xl font-display font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  {sem.number}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform group-hover:translate-x-0.5"
                  style={{ color: "var(--text-subtle)" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                {sem.label}
              </div>
              <div
                className="flex gap-3 mt-2 text-xs font-mono"
                style={{ color: "var(--text-subtle)" }}
              >
                <span>{sem._count.courses} courses</span>
                <span>·</span>
                <span>{sem._count.resources} files</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
