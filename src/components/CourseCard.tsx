import Link from "next/link";
import { stageForClass } from "@/lib/utils";

type CourseCardProps = {
  slug: string;
  title: string;
  classLevel: number;
  level: string;
  language: string;
  thumbnailUrl?: string | null;
  instructorName: string;
  lessonCount?: number;
  enrollmentCount?: number;
  subject: { name: string; icon: string; colorHex: string };
};

export function CourseCard(props: CourseCardProps) {
  return (
    <Link
      href={`/courses/${props.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div
        className="relative aspect-video w-full overflow-hidden"
        style={{ backgroundColor: props.subject.colorHex }}
      >
        {props.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.thumbnailUrl}
            alt={props.title}
            className="h-full w-full object-cover opacity-90 transition group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl">{props.subject.icon}</div>
        )}
        <span className="badge absolute left-3 top-3 bg-white/90 text-slate-700">
          {props.subject.icon} {props.subject.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="badge bg-brand-50 text-brand-700">Class {props.classLevel}</span>
          <span className="badge bg-slate-100 text-slate-600">{props.level}</span>
          <span className="badge bg-slate-100 text-slate-600">{props.language}</span>
        </div>
        <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700">
          {props.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{stageForClass(props.classLevel)} stage</p>

        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500">
          <span className="truncate">👩‍🏫 {props.instructorName}</span>
          <span className="flex shrink-0 items-center gap-3">
            {props.lessonCount != null && <span>🎬 {props.lessonCount}</span>}
            {props.enrollmentCount != null && <span>👥 {props.enrollmentCount}</span>}
          </span>
        </div>
      </div>
    </Link>
  );
}
