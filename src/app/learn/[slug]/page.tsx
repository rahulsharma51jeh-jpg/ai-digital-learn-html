import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, getEnrollmentState } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { CoursePlayer } from "@/components/CoursePlayer";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  return { title: course ? `Learn: ${course.title}` : "Learn" };
}

export default async function LearnPage({ params }: Props) {
  // Middleware already guards /learn, but we re-check for enrollment.
  const session = await getSession();
  if (!session) redirect(`/login?next=/learn/${params.slug}`);

  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const state = await getEnrollmentState(session.sub, course.id);
  if (!state.enrolled) redirect(`/courses/${course.slug}`);

  return (
    <div className="container-page py-8">
      <CoursePlayer
        courseTitle={course.title}
        courseSlug={course.slug}
        lessons={course.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          youtubeVideoId: l.youtubeVideoId,
          durationSeconds: l.durationSeconds,
          order: l.order,
        }))}
        initialCompleted={state.completedLessonIds}
      />
    </div>
  );
}
