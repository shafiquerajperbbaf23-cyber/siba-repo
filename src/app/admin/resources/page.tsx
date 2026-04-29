// src/app/admin/resources/page.tsx
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { ResourceTypeBadge } from "@/components/ui/ResourceTypeBadge";
import { AdminResourceDeleteButton } from "@/components/admin/AdminResourceDeleteButton";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { page?: string; q?: string; type?: string; program?: string };
}

const PAGE_SIZE = 25;

async function getResources(params: Props["searchParams"]) {
  const page = parseInt(params.page ?? "1", 10);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.ResourceWhereInput = {};
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { course: { code: { contains: params.q, mode: "insensitive" } } },
    ];
  }
  if (params.type) where.type = { slug: params.type };
  if (params.program) where.program = { slug: params.program };

  const [resources, total, resourceTypes, programs] = await Promise.all([
    prisma.resource.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        type: true,
        course: { select: { name: true, code: true } },
        semester: { select: { label: true } },
        program: { select: { name: true, slug: true } },
      },
    }),
    prisma.resource.count({ where }),
    prisma.resourceType.findMany(),
    prisma.program.findMany({ select: { name: true, slug: true } }),
  ]);

  return { resources, total, page, resourceTypes, programs, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function AdminResourcesPage({ searchParams }: Props) {
  const { resources, total, page, resourceTypes, programs, totalPages } =
    await getResources(searchParams);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Resources</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{total} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/resources/bulk-upload" className="btn-ghost text-sm">
            Bulk Upload
          </Link>
          <Link href="/admin/resources/new" className="btn-primary text-sm">
            + Add Resource
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <form className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={searchParams.q}
            placeholder="Search by title or course code…"
            className="input flex-1 text-sm py-1.5"
          />
          <button type="submit" className="btn-primary text-sm px-3 py-1.5">
            Search
          </button>
        </form>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs" style={{ color: "var(--text-subtle)" }}>Program:</span>
          <Link
            href={`/admin/resources${searchParams.q ? `?q=${searchParams.q}` : ""}`}
            className={`badge cursor-pointer ${!searchParams.program ? "badge-accent" : ""}`}
          >
            All
          </Link>
          {programs.map((p) => (
            <Link
              key={p.slug}
              href={`/admin/resources?program=${p.slug}${searchParams.q ? `&q=${searchParams.q}` : ""}`}
              className={`badge cursor-pointer ${searchParams.program === p.slug ? "badge-accent" : ""}`}
            >
              {p.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs" style={{ color: "var(--text-subtle)" }}>Type:</span>
          <Link
            href={`/admin/resources${searchParams.q ? `?q=${searchParams.q}` : ""}${searchParams.program ? `${searchParams.q ? "&" : "?"}program=${searchParams.program}` : ""}`}
            className={`badge cursor-pointer ${!searchParams.type ? "badge-accent" : ""}`}
          >
            All
          </Link>
          {resourceTypes.map((t) => (
            <Link
              key={t.slug}
              href={`/admin/resources?type=${t.slug}${searchParams.q ? `&q=${searchParams.q}` : ""}${searchParams.program ? `&program=${searchParams.program}` : ""}`}
              className={`badge cursor-pointer ${searchParams.type === t.slug ? "badge-accent" : ""}`}
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Course</th>
              <th className="text-left px-4 py-3 text-xs font-semibold hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>Semester</th>
              <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
                  No resources found.
                </td>
              </tr>
            )}
            {resources.map((res, i) => (
              <tr
                key={res.id}
                style={{
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                  backgroundColor: "var(--bg)",
                }}
              >
                <td className="px-4 py-3">
                  <div className="font-medium truncate max-w-xs" style={{ color: "var(--text)" }}>
                    {res.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                    {new Date(res.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <ResourceTypeBadge slug={res.type.slug} name={res.type.name} size="sm" />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {res.course.code}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "var(--text-subtle)" }}>
                    {res.course.name}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="badge">{res.program.name}</span>
                  <span className="badge ml-1">{res.semester.label}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    
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
                    <AdminResourceDeleteButton resourceId={res.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            if (searchParams.q) sp.set("q", searchParams.q);
            if (searchParams.type) sp.set("type", searchParams.type);
            if (searchParams.program) sp.set("program", searchParams.program);
            sp.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/resources?${sp.toString()}`}
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
    </div>
  );
}
