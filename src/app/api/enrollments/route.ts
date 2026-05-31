import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { enrollSchema } from "@/lib/validators";
import { handle, ok, fail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/enrollments -> my enrolled courses with computed progress
export async function GET() {
  return handle(async () => {
    const session = await getSession();
    if (!session) return fail("Unauthorized", 401);

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: {
            subject: { select: { name: true, icon: true, colorHex: true, slug: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
    });

    const completed = await prisma.lessonProgress.findMany({
      where: { userId: session.sub, completed: true },
      select: { lessonId: true, lesson: { select: { courseId: true } } },
    });
    const completedByCourse = new Map<string, number>();
    for (const p of completed) {
      const cid = p.lesson.courseId;
      completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
    }

    return ok(
      enrollments.map((e) => {
        const total = e.course._count.lessons;
        const done = completedByCourse.get(e.courseId) ?? 0;
        return {
          enrolledAt: e.createdAt,
          course: {
            id: e.course.id,
            title: e.course.title,
            slug: e.course.slug,
            classLevel: e.course.classLevel,
            thumbnailUrl: e.course.thumbnailUrl,
            subject: e.course.subject,
            lessonCount: total,
            completedCount: done,
            progressPct: total > 0 ? Math.round((done / total) * 100) : 0,
          },
        };
      })
    );
  });
}

// POST /api/enrollments { courseId } -> idempotent enroll
export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await getSession();
    if (!session) return fail("Unauthorized", 401);

    const { courseId } = enrollSchema.parse(await req.json());

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return fail("Course not found", 404);

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: session.sub, courseId } },
      update: {},
      create: { userId: session.sub, courseId },
    });

    return ok({ enrolled: true, enrollmentId: enrollment.id }, { status: 201 });
  });
}
