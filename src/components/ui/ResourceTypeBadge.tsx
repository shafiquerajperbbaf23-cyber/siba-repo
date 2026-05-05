// src/components/ui/ResourceTypeBadge.tsx

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  notes: { color: "#2563eb", bg: "#eff6ff", icon: "📄" },
  slides: { color: "#7c3aed", bg: "#f5f3ff", icon: "🖼️" },
  books: { color: "#059669", bg: "#ecfdf5", icon: "📚" },
  assignments: { color: "#d97706", bg: "#fffbeb", icon: "📋" },
  miscellaneous: { color: "#6b7280", bg: "#f9fafb", icon: "📦" },
};

const DARK_TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  notes: { color: "#93c5fd", bg: "#1e3a5f" },
  slides: { color: "#c4b5fd", bg: "#2e1b6e" },
  books: { color: "#6ee7b7", bg: "#0a3728" },
  "past-papers": { color: "#fca5a5", bg: "#4c0519" },
  assignments: { color: "#fcd34d", bg: "#3d2200" },
  miscellaneous: { color: "#d1d5db", bg: "#1f2937" },
};

interface Props {
  slug: string;
  name: string;
  size?: "sm" | "md";
}

export function ResourceTypeBadge({ slug, name, size = "md" }: Props) {
  const config = TYPE_CONFIG[slug] ?? TYPE_CONFIG.miscellaneous;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs"
      }`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span>{config.icon}</span>
      {name}
    </span>
  );
}
