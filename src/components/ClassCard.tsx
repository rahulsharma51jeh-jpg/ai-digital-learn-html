import Link from "next/link";
import { stageForClass } from "@/lib/utils";

export function ClassCard({
  classLevel,
  subjectCount,
  courseCount,
}: {
  classLevel: number;
  subjectCount: number;
  courseCount: number;
}) {
  return (
    <Link
      href={`/classes/${classLevel}`}
      className="card group flex flex-col items-start p-5 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover"
    >
      <div className="flex w-full items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-700">
          {classLevel}
        </span>
        <span className="badge bg-slate-100 text-slate-500">{stageForClass(classLevel)}</span>
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-brand-700">
        Class {classLevel}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {subjectCount} subjects · {courseCount} courses
      </p>
      <span className="mt-3 text-sm font-semibold text-brand-600 group-hover:underline">
        Explore →
      </span>
    </Link>
  );
}
