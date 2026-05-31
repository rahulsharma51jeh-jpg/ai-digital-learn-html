"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { CLASS_LEVELS } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [form, setForm] = useState({ name: "", email: "", password: "", classLevel: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister
      ? {
          name: form.name,
          email: form.email,
          password: form.password,
          classLevel: form.classLevel ? Number(form.classLevel) : null,
        }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) {
        const msg = json.issues?.[0]?.message ?? json.error ?? "Something went wrong";
        throw new Error(msg);
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {isRegister && (
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input
            id="name"
            className="input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Aarav Kumar"
            required
          />
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="input"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="input"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder={isRegister ? "At least 8 characters" : "••••••••"}
          required
        />
      </div>

      {isRegister && (
        <div>
          <label className="label" htmlFor="classLevel">Your class (optional)</label>
          <select
            id="classLevel"
            className="input"
            value={form.classLevel}
            onChange={(e) => update("classLevel", e.target.value)}
          >
            <option value="">Select your class</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full text-base">
        {loading ? "Please wait…" : isRegister ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-slate-500">
        {isRegister ? (
          <>Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link>
          </>
        ) : (
          <>New to Infinity BSEB?{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">Create account</Link>
          </>
        )}
      </p>
    </form>
  );
}
