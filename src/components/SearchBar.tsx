"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchResult = {
  courses: { id: string; title: string; slug: string; classLevel: number }[];
  subjects: { id: string; name: string; slug: string; icon: string; classLevel: number }[];
};

export function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const json = await res.json();
        if (json.ok) {
          setResults(json.data);
          setOpen(true);
        }
      } catch {
        /* aborted */
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hasResults = results && (results.courses.length > 0 || results.subjects.length > 0);

  return (
    <div className="relative w-full" ref={boxRef}>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder="Search subjects, courses…"
          className="input pl-9"
          aria-label="Search"
        />
      </div>

      {open && hasResults && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-card-hover">
          {results!.subjects.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Subjects
              </p>
              {results!.subjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/classes/${s.classLevel}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                >
                  <span>{s.icon}</span>
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="ml-auto text-xs text-slate-400">Class {s.classLevel}</span>
                </Link>
              ))}
            </div>
          )}
          {results!.courses.length > 0 && (
            <div>
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Courses
              </p>
              {results!.courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-700">{c.title}</span>
                  <span className="ml-auto text-xs text-slate-400">Class {c.classLevel}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
