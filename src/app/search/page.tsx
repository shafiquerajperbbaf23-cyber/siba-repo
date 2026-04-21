// src/app/search/page.tsx
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SearchBar } from "@/components/public/SearchBar";
import { ResourceTypeBadge } from "@/components/ui/ResourceTypeBadge";
import Link from "next/link";

interface Props {
  searchParams: {
    q?: string;
    program?: string;
    semester?: string;
    type?: string;
    page?: string;
  };
}

const PAGE_SIZE = 20;

async function search(params: Props["searchParams"]) {
  const page = parseInt(params.page ?? "1", 10);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Parameters<typeof prisma.resource.findMany>[0]["where"] = {};

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { course: { name: { contains: params.q, mode: "insensitive" } } },
      { course: { code: { contains: params.q, mode: "insensitive" } } },
      { tags: { some: { tag: { name: { contains: params.q, mode: "insensitive" } } } } },
    ];
  }

  if (params.program) {
    where.program = { slug: params.program };
  }

  if (params.semester) {
    where.semester = { number: parseInt(params.semester, 10) };
  }

  if (params.type) {
    where.type = { slug: params.type };
  }

  const [resources, total, programs, resourceTypes] = await Promise.all([
    prisma.resource.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        type: true,
        course: { select: { name: true, code: true } },
        semester: { select: { number: true, label: true } },
        program: { select: { name: true, slug: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.resource.count({ where }),
    prisma.program.findMany({ select: { name: true, slug: true } }),
    prisma.resourceType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { resources, total, page, programs, resourceTypes };
}

export default async function SearchPage({ searchParams }: Props) {
  const { resources, total, page, programs, resourceTypes } = await search(searchParams);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]} />

        <div className="mt-6 mb-8">
          <h1 className="section-title mb-4">
            {searchParams.q ? `Results for "${searchParams.q}"` : "Browse All Resources"}
          </h1>
          <SearchBar defaultValue={searchParams.q} />
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20 space-y-6">
              <FilterSection title="Program">
                <FilterLink
                  href="/search"
                  searchParams={searchParams}
                  removeKey="program"
                  active={!searchParams.program}
                  label="All Programs"
                />
                {programs.map((p) => (
                  <FilterLink
                    key={p.slug}
                    href="/search"
                    searchParams={searchParams}
                    filterKey="program"
                    filterValue={p.slug}
                    active={searchParams.program === p.slug}
                    label={p.name}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Resource Type">
                <FilterLink
                  href="/search"
                  searchParams={searchParams}
                  removeKey="type"
                  active={!searchParams.type}
                  label="All Types"
                />
                {resourceTypes.map((rt) => (
                  <FilterLink
                    key={rt.slug}
                    href="/search"
                    searchParams={searchParams}
                    filterKey="type"
                    filterValue={rt.slug}
                    active={searchParams.type === rt.slug}
                    label={rt.name}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Semester">
                <FilterLink
                  href="/search"
                  searchParams={searchParams}
                  removeKey="semester"
                  active={!searchParams.semester}
                  label="All Semesters"
                />
                {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                  <FilterLink
                    key={n}
                    href="/search"
                    searchParams={searchParams}
                    filterKey="semester"
                    filterValue={String(n)}
                    active={searchParams.semester === String(n)}
                    label={`Semester ${n}`}
                  />
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {total} result{total !== 1 ? "s" : ""}
              </p>
            </div>

            {resources.length === 0 ? (
              <div className="card p-12 text-center" style={{ color: "var(--text-subtle)" }}>
                No resources found. Try a different search or clear filters.
              </div>
            ) : (
              <div className="space-y-2">
                {resources.map((res) => (
                  <a
                    key={res.id}
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card flex items-start gap-4 p-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <ResourceTypeBadge slug={res.type.slug} name={res.type.name} size="sm" />
                        <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                          {res.program.name} · {res.semester.label}
                        </span>
                      </div>
                      <div className="font-medium" style={{ color: "var(--text)" }}>
                        {res.title}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                        {res.course.code} — {res.course.name}
                      </div>
                      {res.description && (
                        <div className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                          {res.description}
                        </div>
                      )}
                      {res.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {res.tags.map(({ tag }) => (
                            <span key={tag.id} className="badge">{tag.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {res.year && (
                        <span className="badge">{res.year}</span>
                      )}
                      {res.fileSize && (
                        <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                          {res.fileSize}
                        </span>
                      )}
                      <span className="btn-primary text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open ↗
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const sp = new URLSearchParams();
                  if (searchParams.q) sp.set("q", searchParams.q);
                  if (searchParams.program) sp.set("program", searchParams.program);
                  if (searchParams.semester) sp.set("semester", searchParams.semester);
                  if (searchParams.type) sp.set("type", searchParams.type);
                  sp.set("page", String(p));
                  return (
                    <Link
                      key={p}
                      href={`/search?${sp.toString()}`}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page ? "btn-primary" : "btn-ghost"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Filter helpers
function buildFilterUrl(
  base: string,
  searchParams: Record<string, string | undefined>,
  filterKey?: string,
  filterValue?: string,
  removeKey?: string
) {
  const sp = new URLSearchParams();
  if (searchParams.q) sp.set("q", searchParams.q);
  if (searchParams.program && removeKey !== "program") sp.set("program", searchParams.program);
  if (searchParams.semester && removeKey !== "semester") sp.set("semester", searchParams.semester);
  if (searchParams.type && removeKey !== "type") sp.set("type", searchParams.type);
  if (filterKey && filterValue) sp.set(filterKey, filterValue);
  return `${base}?${sp.toString()}`;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-subtle)" }}>
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  searchParams,
  filterKey,
  filterValue,
  removeKey,
  active,
  label,
}: {
  href: string;
  searchParams: Record<string, string | undefined>;
  filterKey?: string;
  filterValue?: string;
  removeKey?: string;
  active: boolean;
  label: string;
}) {
  const url = buildFilterUrl(href, searchParams, filterKey, filterValue, removeKey);
  return (
    <Link
      href={url}
      className={`block px-2 py-1 rounded-md text-sm transition-colors ${
        active
          ? "font-semibold"
          : "hover:bg-[var(--bg-subtle)]"
      }`}
      style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
    >
      {label}
    </Link>
  );
}
