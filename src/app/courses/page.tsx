import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/CourseCard";
import { CLASS_LEVELS, cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "All Courses",
  description: "Explore every BSEB course across Class 1 to 12.",
};

type Props = { searchParams: { class?: string } };

export default async function CoursesPage({ searchParams }: Props) {
  const selected = searchParams.class ? Number(searchParams.class) : null;
  const validSelected = selected && selected >= 1 && selected <= 12 ? selected : null;

  const where: Prisma.CourseWhereInput = validSelected ? { classLevel: validSelected } : {};
  const courses = await prisma.course.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      subject: { select: { name: true, icon: true, colorHex: true, slug: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  });

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">All courses</h1>
        <p className="mt-2 text-slate-600">
          {courses.length} course{courses.length === 1 ? "" : "s"}
          {validSelected ? ` for Class ${validSelected}` : " across all classes"}.
        </p>
      </header>

      {/* Class filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={cn(
            "badge px-3 py-1.5 text-sm",
            !validSelected ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
          )}
        >
          All
        </Link>
        {CLASS_LEVELS.map((c) => (
          <Link
            key={c}
            href={`/courses?class=${c}`}
            className={cn(
              "badge px-3 py-1.5 text-sm",
              validSelected === c
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-300"
            )}
          >
            Class {c}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <p className="text-slate-500">No courses found.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
}
