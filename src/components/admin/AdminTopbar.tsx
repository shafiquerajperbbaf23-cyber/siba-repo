// src/components/admin/AdminTopbar.tsx
"use client";

import { signOut } from "next-auth/react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface Props {
  user?: { name?: string | null; email?: string | null };
}

export function AdminTopbar({ user }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b shrink-0"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
    >
      <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
        Administration Panel
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="btn-ghost px-2.5 py-2"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}
          >
            {user?.name?.slice(0, 1).toUpperCase() ?? "A"}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--text)" }}>
            {user?.name ?? "Admin"}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="btn-ghost text-xs px-3 py-1.5"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
