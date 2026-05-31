import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getEnrollmentState } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { EnrollButton } from "@/components/EnrollButton";
import { formatDuration, stageForClass } from "@/lib/utils";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.description };
}

export default async function CourseDetailPage({ params }: Props) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const session = await getSession();
  const state = session
    ? await getEnrollmentState(session.sub, course.id)
    : { enrolled: false, completedLessonIds: [] as string[] };

  const totalSeconds = course.lessons.reduce((sum, l) => sum + l.durationSeconds, 0);

  return (
    <div>
      {/* Header band */}
      <div className="bg-slate-900 text-white">
        <div className="container-page py-10">
          <nav className="mb-4 text-sm text-slate-400">
            <Link href={`/classes/${course.classLevel}`} className="hover:text-white">
              Class {course.classLevel}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-200">{course.subject.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-brand-600 text-white">{course.subject.icon} {course.subject.name}</span>
            <span className="badge bg-white/10 text-white">Class {course.classLevel}</span>
            <span className="badge bg-white/10 text-white">{course.level}</span>
            <span className="badge bg-white/10 text-white">{course.language}</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{course.description}</p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            <span>👩‍🏫 {course.instructorName}</span>
            <span>🎬 {course.lessons.length} lessons</span>
            <span>⏱ {formatDuration(totalSeconds)} total</span>
            <span>👥 {course._count.enrollments} enrolled</span>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        {/* Curriculum */}
        <section>
          <h2 className="text-xl font-bold text-slate-900">Course curriculum</h2>
          <p className="mt-1 text-sm text-slate-500">
            {course.lessons.length} lessons · {stageForClass(course.classLevel)} stage
          </p>

          <ul className="mt-5 space-y-2">
            {course.lessons.map((l) => {
              const done = state.completedLessonIds.includes(l.id);
              const locked = !state.enrolled && !l.isFreePreview;
              return (
                <li key={l.id} className="card flex items-center gap-4 p-4">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                      done ? "bg-green-100 text-green-700" : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {done ? "✓" : l.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{l.title}</p>
                    <p className="text-xs text-slate-500">{formatDuration(l.durationSeconds)}</p>
                  </div>
                  {l.isFreePreview && (
                    <span className="badge bg-accent-500 text-white">Free preview</span>
                  )}
                  {locked && <span className="text-slate-300">🔒</span>}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Sticky enroll card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div
              className="aspect-video w-full"
              style={{ backgroundColor: course.subject.colorHex }}
            >
              {course.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-6xl">{course.subject.icon}</div>
              )}
            </div>
            <div className="space-y-4 p-5">
              <div className="text-center">
                <span className="text-2xl font-extrabold text-slate-900">Free</span>
                <p className="text-xs text-slate-500">Full access · no payment required</p>
              </div>
              <EnrollButton
                courseId={course.id}
                slug={course.slug}
                enrolled={state.enrolled}
                isAuthed={Boolean(session)}
              />
              <ul className="space-y-2 pt-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">✅ {course.lessons.length} video lessons</li>
                <li className="flex items-center gap-2">✅ Learn at your own pace</li>
                <li className="flex items-center gap-2">✅ Progress tracking</li>
                <li className="flex items-center gap-2">✅ Works on mobile</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
