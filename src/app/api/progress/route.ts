import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { progressSchema } from "@/lib/validators";
import { handle, ok, fail } from "@/lib/api";

export const runtime = "nodejs";

// POST /api/progress { lessonId, completed?, watchedSeconds? } -> upsert progress
export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await getSession();
    if (!session) return fail("Unauthorized", 401);

    const input = progressSchema.parse(await req.json());

    const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });
    if (!lesson) return fail("Lesson not found", 404);

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.sub, lessonId: input.lessonId } },
      update: {
        ...(input.completed !== undefined ? { completed: input.completed } : {}),
        ...(input.watchedSeconds !== undefined ? { watchedSeconds: input.watchedSeconds } : {}),
      },
      create: {
        userId: session.sub,
        lessonId: input.lessonId,
        completed: input.completed ?? false,
        watchedSeconds: input.watchedSeconds ?? 0,
      },
    });

    return ok({
      lessonId: progress.lessonId,
      completed: progress.completed,
      watchedSeconds: progress.watchedSeconds,
    });
  });
}
