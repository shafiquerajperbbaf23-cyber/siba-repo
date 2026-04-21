// src/components/ui/Breadcrumb.tsx
import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span style={{ color: "var(--border-strong)" }}>/</span>
          )}
          {crumb.href && i < crumbs.length - 1 ? (
            <Link
              href={crumb.href}
              className="transition-colors hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              style={{
                color: i === crumbs.length - 1 ? "var(--text)" : "var(--text-muted)",
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
              }}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
