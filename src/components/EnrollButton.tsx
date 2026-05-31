"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnrollButton({
  courseId,
  slug,
  enrolled,
  isAuthed,
}: {
  courseId: string;
  slug: string;
  enrolled: boolean;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthed) {
    return (
      <button
        onClick={() => router.push(`/login?next=/courses/${slug}`)}
        className="btn-primary w-full text-base"
      >
        Log in to enroll
      </button>
    );
  }

  if (enrolled) {
    return (
      <button onClick={() => router.push(`/learn/${slug}`)} className="btn-accent w-full text-base">
        ▶ Continue learning
      </button>
    );
  }

  async function enroll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Could not enroll");
      router.push(`/learn/${slug}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button onClick={enroll} disabled={loading} className="btn-primary w-full text-base">
        {loading ? "Enrolling…" : "Enroll for free"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
