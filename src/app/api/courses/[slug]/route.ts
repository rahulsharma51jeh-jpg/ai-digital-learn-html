import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handle, ok, fail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/courses/:slug -> full course with lessons (+ enrollment/progress if logged in)
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        subject: { select: { name: true, slug: true, icon: true, colorHex: true } },
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) return fail("Course not found", 404);

    const session = await getSession();
    let enrolled = false;
    let completedLessonIds: string[] = [];

    if (session) {
      const [enrollment, progress] = await Promise.all([
        prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.sub, courseId: course.id } },
        }),
        prisma.lessonProgress.findMany({
          where: {
            userId: session.sub,
            completed: true,
            lesson: { courseId: course.id },
          },
          select: { lessonId: true },
        }),
      ]);
      enrolled = Boolean(enrollment);
      completedLessonIds = progress.map((p) => p.lessonId);
    }

    return ok({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      classLevel: course.classLevel,
      language: course.language,
      level: course.level,
      thumbnailUrl: course.thumbnailUrl,
      instructorName: course.instructorName,
      subject: course.subject,
      enrollmentCount: course._count.enrollments,
      enrolled,
      completedLessonIds,
      lessons: course.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        youtubeVideoId: l.youtubeVideoId,
        durationSeconds: l.durationSeconds,
        order: l.order,
        isFreePreview: l.isFreePreview,
      })),
    });
  });
}
