// src/components/public/SearchBar.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

interface Props {
  defaultValue?: string;
  placeholder?: string;
  size?: "sm" | "lg";
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search courses, notes, papers…",
  size = "lg",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <svg
            width={size === "lg" ? 18 : 14}
            height={size === "lg" ? 18 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--text-subtle)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`input pl-10 ${
            size === "lg" ? "py-3 text-base" : "py-2 text-sm"
          } pr-24`}
        />
        <button
          type="submit"
          className="absolute right-2 inset-y-2 btn-primary text-xs px-3 py-1 h-auto"
        >
          Search
        </button>
      </div>
    </form>
  );
}
