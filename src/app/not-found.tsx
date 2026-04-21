// src/app/not-found.tsx
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div
          className="text-8xl font-display font-bold mb-4"
          style={{ color: "var(--bg-muted)" }}
        >
          404
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
          Page not found
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
