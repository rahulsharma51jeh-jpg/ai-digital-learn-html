import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-xl font-black text-white">
              ∞
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Create your account</h1>
          <p className="mt-1 text-slate-500">Start learning for free — no credit card needed.</p>
        </div>

        <div className="card p-6 sm:p-8">
          <Suspense fallback={<div className="h-80" />}>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
