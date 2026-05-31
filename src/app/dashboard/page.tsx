import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getMyEnrollments } from "@/lib/queries";

export const metadata: Metadata = { title: "My Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  const enrollments = await getMyEnrollments(session.sub);

  const totalLessons = enrollments.reduce((s, e) => s + e.lessonCount, 0);
  const completedLessons = enrollments.reduce((s, e) => s + e.completedCount, 0);
  const inProgress = enrollments.filter((e) => e.progressPct > 0 && e.progressPct < 100).length;

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Hi, {session.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-slate-600">
          {session.classLevel ? `Class ${session.classLevel} · ` : ""}Keep up the momentum.
        </p>
      </header>

      {/* Stat cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled courses" value={enrollments.length} icon="📚" />
        <StatCard label="In progress" value={inProgress} icon="⏳" />
        <StatCard label="Lessons completed" value={completedLessons} icon="✅" />
        <StatCard label="Total lessons" value={totalLessons} icon="🎬" />
      </div>

      <h2 className="mb-4 text-xl font-bold text-slate-900">My courses</h2>

      {enrollments.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <span className="text-5xl">🚀</span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No courses yet</h3>
          <p className="mt-1 max-w-sm text-slate-500">
            Explore courses for your class and enroll to start learning.
          </p>
          <Link href="/courses" className="btn-primary mt-5">Browse courses</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Link
              key={e.course.id}
              href={`/learn/${e.course.slug}`}
              className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div
                className="relative aspect-video w-full"
                style={{ backgroundColor: e.course.subject.colorHex }}
              >
                {e.course.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.course.thumbnailUrl}
                    alt={e.course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-5xl">
                    {e.course.subject.icon}
                  </div>
                )}
                <span className="badge absolute left-3 top-3 bg-white/90 text-slate-700">
                  Class {e.course.classLevel}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700">
                  {e.course.title}
                </h3>
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{e.completedCount} / {e.lessonCount} lessons</span>
                    <span className="font-semibold text-brand-600">{e.progressPct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all"
                      style={{ width: `${e.progressPct}%` }}
                    />
                  </div>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand-600 group-hover:underline">
                    {e.progressPct === 0 ? "Start learning →" : e.progressPct === 100 ? "Review →" : "Continue →"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">{icon}</span>
      <div>
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}
