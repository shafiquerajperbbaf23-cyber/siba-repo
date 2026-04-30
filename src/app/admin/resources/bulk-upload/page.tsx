// src/app/admin/resources/bulk-upload/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TEMPLATE = `title,description,fileUrl,fileSize,year,typeSlug,courseCode,semesterNumber,programSlug,tags
"Introduction to Management Notes","Chapter 1-5 lecture notes","https://archive.org/download/example/notes.pdf","2.1 MB",,"notes","MGT-101","1","bba","management,intro"
"Financial Accounting Past Paper 2022","Annual exam paper","https://archive.org/download/example/paper.pdf","450 KB",2022,"past-papers","ACC-101","1","bba","past-paper,2022"`;

export default function BulkUploadPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { index: number; error: string }[] } | null>(null);

  const handleSubmit = async () => {
    if (!csvText.trim()) return;
    setLoading(true);
    setResult(null);

    // Parse CSV to JSON
    const lines = csvText.trim().split("\n");
    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      return headers.reduce((acc, h, i) => ({ ...acc, [h.trim()]: values[i]?.trim() ?? "" }), {} as Record<string, string>);
    });

    // Fetch reference data for ID resolution
    const [typesRes, coursesRes] = await Promise.all([
      fetch("/api/resource-types").then((r) => r.json()),
      fetch("/api/courses/all").then((r) => r.json()),
    ]);

    const typeMap: Record<string, string> = Object.fromEntries(typesRes.map((t: { slug: string; id: string }) => [t.slug, t.id]));
    const courseMap: Record<string, { id: string; semesterId: string; programId: string }> = Object.fromEntries(
      coursesRes.map((c: { code: string; id: string; semester: { id: string; programId: string } }) => [
        c.code,
        { id: c.id, semesterId: c.semester.id, programId: c.semester.programId },
      ])
    );

    const resources = rows.map((row) => {
  const course = courseMap[row.courseCode];
  return {
    title: row.title,
    description: row.description || undefined,
    fileUrl: row.fileUrl,
    fileSize: row.fileSize || undefined,
    year: row.year ? parseInt(row.year, 10) : undefined,
    typeId: typeMap[row.typeSlug],
    courseId: course?.id,
    semesterId: course?.semesterId,
    programId: course?.programId,
    tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
  };
});

// DEBUG — remove after fixing
console.log("Total rows parsed:", rows.length);
console.log("Sample row:", rows[0]);
console.log("typeMap keys:", Object.keys(typeMap));
console.log("courseMap keys:", Object.keys(courseMap).slice(0, 5));
console.log("Sample resource:", resources[0]);
console.log("Resources with missing IDs:", resources.filter(r => !r.courseId || !r.typeId).length);

    const res = await fetch("/api/resources/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resources }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);

    if (data.errors?.length === 0) {
      setTimeout(() => router.push("/admin/resources"), 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Bulk Upload</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Paste CSV data to import multiple resources at once.
        </p>
      </div>

      {/* Template */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>CSV Template</span>
          <button
            onClick={() => setCsvText(TEMPLATE)}
            className="btn-ghost text-xs px-2 py-1"
          >
            Load Template
          </button>
        </div>
        <pre
          className="text-xs overflow-x-auto p-3 rounded-lg font-mono"
          style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}
        >
          {TEMPLATE}
        </pre>
      </div>

      {/* CSV input */}
      <div className="card p-4">
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
          Paste CSV Data
        </label>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="input font-mono text-xs resize-none"
          rows={12}
          placeholder="Paste your CSV here (including header row)…"
        />
      </div>

      {/* Result */}
      {result && (
        <div
          className="card p-4 text-sm"
          style={{
            backgroundColor: result.errors?.length === 0 ? "#ecfdf5" : "#fef2f2",
            borderColor: result.errors?.length === 0 ? "#6ee7b7" : "#fca5a5",
          }}
        >
          <div style={{ color: result.errors?.length === 0 ? "#059669" : "#dc2626" }}>
            ✓ Created {result.created} resources
            {result.errors?.length > 0 && ` · ${result.errors.length} failed`}
          </div>
          {result.errors?.map((e) => (
            <div key={e.index} className="text-xs mt-1" style={{ color: "#dc2626" }}>
              Row {e.index + 2}: {e.error}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !csvText.trim()}
          className="btn-primary"
        >
          {loading ? "Importing…" : "Import Resources"}
        </button>
        <button onClick={() => router.back()} className="btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
