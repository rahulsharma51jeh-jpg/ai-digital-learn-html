import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-xl font-black text-white">
              ∞
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-slate-500">Log in to continue learning.</p>
        </div>

        <div className="card p-6 sm:p-8">
          <Suspense fallback={<div className="h-64" />}>
            <AuthForm mode="login" />
          </Suspense>
        </div>

        <div className="mt-4 rounded-xl bg-brand-50 p-4 text-center text-sm text-brand-800">
          <p className="font-semibold">Demo account</p>
          <p className="mt-1">student@infinitybseb.in · password123</p>
        </div>
      </div>
    </div>
  );
}
