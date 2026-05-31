"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";

type NavUser = { name: string; role: string; classLevel: number | null } | null;

export function Navbar({ user }: { user: NavUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white">
            ∞
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Infinity<span className="text-brand-600">BSEB</span>
          </span>
        </Link>

        <div className="hidden flex-1 px-6 lg:block">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Link href="/classes" className="btn-ghost">
            Classes
          </Link>
          <Link href="/courses" className="btn-ghost">
            Courses
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
              <span className="mx-1 hidden text-sm text-slate-400 lg:inline">|</span>
              <span className="hidden max-w-[8rem] truncate text-sm font-medium text-slate-700 lg:inline">
                {user.name}
              </span>
              <button onClick={logout} disabled={loggingOut} className="btn-outline">
                {loggingOut ? "..." : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 md:hidden">
          <div className="mb-3">
            <SearchBar />
          </div>
          <div className="flex flex-col gap-1">
            <Link href="/classes" className="btn-ghost justify-start" onClick={() => setOpen(false)}>
              Classes
            </Link>
            <Link href="/courses" className="btn-ghost justify-start" onClick={() => setOpen(false)}>
              Courses
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost justify-start" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={logout} className="btn-outline mt-1 justify-start">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline mt-1" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link href="/register" className="btn-primary" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
