import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectsForClass, getCoursesForClass } from "@/lib/queries";
import { CourseCard } from "@/components/CourseCard";
import { stageForClass } from "@/lib/utils";

type Props = { params: { level: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Class ${params.level} — Courses & Subjects` };
}

export default async function ClassDetailPage({ params }: Props) {
  const classLevel = Number(params.level);
  if (Number.isNaN(classLevel) || classLevel < 1 || classLevel > 12) notFound();

  const [subjects, courses] = await Promise.all([
    getSubjectsForClass(classLevel),
    getCoursesForClass(classLevel),
  ]);

  return (
    <div className="container-page py-12">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/classes" className="hover:text-brand-600">Classes</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Class {classLevel}</span>
      </nav>

      <header className="mb-8 flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-2xl font-black text-white">
          {classLevel}
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Class {classLevel}</h1>
          <p className="text-slate-500">
            {stageForClass(classLevel)} · {subjects.length} subjects · {courses.length} courses
          </p>
        </div>
      </header>

      {/* Subjects */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Subjects</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="card flex items-center gap-3 p-4"
              style={{ borderLeft: `4px solid ${s.colorHex}` }}
            >
              <span className="text-2xl">{s.icon}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{s._count.courses} course(s)</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Courses</h2>
        {courses.length === 0 ? (
          <p className="text-slate-500">No courses yet for this class. Check back soon!</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                slug={c.slug}
                title={c.title}
                classLevel={c.classLevel}
                level={c.level}
                language={c.language}
                thumbnailUrl={c.thumbnailUrl}
                instructorName={c.instructorName}
                lessonCount={c._count.lessons}
                enrollmentCount={c._count.enrollments}
                subject={c.subject}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
