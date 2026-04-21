// src/components/admin/AdminResourceDeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminResourceDeleteButton({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-ghost text-xs px-2 py-1"
      style={{ color: "#dc2626" }}
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
