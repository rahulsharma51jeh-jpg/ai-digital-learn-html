"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { VideoPlayer } from "@/components/VideoPlayer";
import { formatDuration, cn, pct } from "@/lib/utils";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  durationSeconds: number;
  order: number;
};

export function CoursePlayer({
  courseTitle,
  courseSlug,
  lessons,
  initialCompleted,
}: {
  courseTitle: string;
  courseSlug: string;
  lessons: Lesson[];
  initialCompleted: string[];
}) {
  const [activeId, setActiveId] = useState(lessons[0]?.id ?? "");
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted));
  const [saving, setSaving] = useState(false);

  const active = useMemo(() => lessons.find((l) => l.id === activeId) ?? lessons[0], [activeId, lessons]);
  const progress = pct(completed.size, lessons.length);

  async function toggleComplete(lessonId: string, value: boolean) {
    setSaving(true);
    // optimistic update
    setCompleted((prev) => {
      const next = new Set(prev);
      value ? next.add(lessonId) : next.delete(lessonId);
      return next;
    });
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: value }),
      });
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    const idx = lessons.findIndex((l) => l.id === activeId);
    if (idx >= 0 && idx < lessons.length - 1) setActiveId(lessons[idx + 1].id);
  }

  if (!active) return null;

  const isActiveDone = completed.has(active.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Player + active lesson */}
      <div>
        <VideoPlayer videoId={active.youtubeVideoId} title={active.title} />

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Lesson {active.order}
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{active.title}</h1>
            {active.description && (
              <p className="mt-2 max-w-2xl text-sm text-slate-600">{active.description}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => toggleComplete(active.id, !isActiveDone)}
              disabled={saving}
              className={cn(isActiveDone ? "btn-outline" : "btn-primary")}
            >
              {isActiveDone ? "✓ Completed" : "Mark complete"}
            </button>
            <button onClick={goNext} className="btn-ghost">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Lesson list / curriculum */}
      <aside className="card h-fit overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <Link href={`/courses/${courseSlug}`} className="text-xs text-slate-400 hover:text-brand-600">
            ← Back to course
          </Link>
          <h2 className="mt-1 line-clamp-1 font-bold text-slate-900">{courseTitle}</h2>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{completed.size} / {lessons.length} lessons</span>
              <span className="font-semibold text-brand-600">{progress}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-auto">
          {lessons.map((l) => {
            const done = completed.has(l.id);
            const isActive = l.id === active.id;
            return (
              <li key={l.id}>
                <button
                  onClick={() => setActiveId(l.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition",
                    isActive ? "bg-brand-50" : "hover:bg-slate-50"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                      done
                        ? "border-green-500 bg-green-500 text-white"
                        : isActive
                          ? "border-brand-500 text-brand-600"
                          : "border-slate-300 text-slate-400"
                    )}
                  >
                    {done ? "✓" : l.order}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        isActive ? "font-semibold text-brand-700" : "text-slate-700"
                      )}
                    >
                      {l.title}
                    </span>
                    <span className="text-xs text-slate-400">{formatDuration(l.durationSeconds)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
