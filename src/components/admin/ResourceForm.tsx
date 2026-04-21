// src/components/admin/ResourceForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SelectOption { id: string; label: string }
interface CourseOption { id: string; code: string; name: string; semesterId: string; semesterLabel: string; programId: string; programName: string }

interface Props {
  mode: "create" | "edit";
  resourceId?: string;
  programs: SelectOption[];
  semesters: { id: string; label: string; number: number; programId: string }[];
  courses: CourseOption[];
  resourceTypes: SelectOption[];
  defaultValues?: {
    title?: string;
    description?: string;
    fileUrl?: string;
    fileSize?: string;
    year?: number;
    typeId?: string;
    courseId?: string;
    semesterId?: string;
    programId?: string;
    tags?: string;
  };
}

export function ResourceForm({
  mode, resourceId, programs, semesters, courses, resourceTypes, defaultValues = {},
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedProgramId, setSelectedProgramId] = useState(defaultValues.programId ?? "");
  const [selectedSemesterId, setSelectedSemesterId] = useState(defaultValues.semesterId ?? "");

  const filteredSemesters = semesters.filter(
    (s) => !selectedProgramId || s.programId === selectedProgramId
  );
  const filteredCourses = courses.filter(
    (c) => !selectedSemesterId || c.semesterId === selectedSemesterId
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const tagsRaw = (fd.get("tags") as string) ?? "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: fd.get("title"),
      description: fd.get("description") || undefined,
      fileUrl: fd.get("fileUrl"),
      fileSize: fd.get("fileSize") || undefined,
      year: fd.get("year") ? parseInt(fd.get("year") as string, 10) : undefined,
      typeId: fd.get("typeId"),
      courseId: fd.get("courseId"),
      semesterId: fd.get("semesterId"),
      programId: fd.get("programId"),
      tags,
    };

    const url = mode === "create" ? "/api/resources" : `/api/resources/${resourceId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error ?? "Unknown error"));
      setLoading(false);
      return;
    }

    router.push("/admin/resources");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="text-sm px-4 py-3 rounded-lg" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* Title */}
      <Field label="Title" required>
        <input name="title" className="input" defaultValue={defaultValues.title} required placeholder="e.g. Chapter 3 Notes — Organizational Behavior" />
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea name="description" className="input resize-none" rows={3} defaultValue={defaultValues.description} placeholder="Optional description…" />
      </Field>

      {/* Archive.org URL */}
      <Field label="File URL (Archive.org)" required>
        <input
          name="fileUrl"
          type="url"
          className="input font-mono text-sm"
          defaultValue={defaultValues.fileUrl}
          required
          placeholder="https://archive.org/download/..."
        />
        <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
          Must be a valid Archive.org download link.
        </p>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        {/* File size */}
        <Field label="File Size">
          <input name="fileSize" className="input" defaultValue={defaultValues.fileSize} placeholder="e.g. 2.4 MB" />
        </Field>
        {/* Year */}
        <Field label="Year (for past papers)">
          <input name="year" type="number" className="input" defaultValue={defaultValues.year} placeholder="e.g. 2023" min={1990} max={2100} />
        </Field>
      </div>

      {/* Resource Type */}
      <Field label="Resource Type" required>
        <select name="typeId" className="input" defaultValue={defaultValues.typeId} required>
          <option value="">Select type…</option>
          {resourceTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </Field>

      {/* Program → Semester → Course cascade */}
      <Field label="Program" required>
        <select
          name="programId"
          className="input"
          required
          defaultValue={defaultValues.programId}
          onChange={(e) => {
            setSelectedProgramId(e.target.value);
            setSelectedSemesterId("");
          }}
        >
          <option value="">Select program…</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Semester" required>
        <select
          name="semesterId"
          className="input"
          required
          value={selectedSemesterId}
          onChange={(e) => setSelectedSemesterId(e.target.value)}
        >
          <option value="">Select semester…</option>
          {filteredSemesters.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Course" required>
        <select name="courseId" className="input" required defaultValue={defaultValues.courseId}>
          <option value="">Select course…</option>
          {filteredCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
          ))}
        </select>
      </Field>

      {/* Tags */}
      <Field label="Tags">
        <input
          name="tags"
          className="input"
          defaultValue={defaultValues.tags}
          placeholder="Comma-separated: e.g. midterm, 2023, spring"
        />
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : mode === "create" ? "Create Resource" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
        {label}{required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
