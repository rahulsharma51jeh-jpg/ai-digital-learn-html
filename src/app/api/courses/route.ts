import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle, ok, fail } from "@/lib/api";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/courses?class=10&subject=<slug>&featured=true&take=20
export async function GET(req: NextRequest) {
  return handle(async () => {
    const sp = req.nextUrl.searchParams;
    const classParam = sp.get("class");
    const subjectSlug = sp.get("subject");
    const featured = sp.get("featured");
    const take = Math.min(Number(sp.get("take") ?? 50), 100);

    const where: Prisma.CourseWhereInput = {};

    if (classParam) {
      const classLevel = Number(classParam);
      if (Number.isNaN(classLevel) || classLevel < 1 || classLevel > 12) {
        return fail("class must be an integer between 1 and 12", 422);
      }
      where.classLevel = classLevel;
    }
    if (subjectSlug) where.subject = { slug: subjectSlug };
    if (featured === "true") where.isFeatured = true;

    const courses = await prisma.course.findMany({
      where,
      take,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        subject: { select: { name: true, slug: true, icon: true, colorHex: true } },
        _count: { select: { lessons: true, enrollments: true } },
      },
    });

    return ok(
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        classLevel: c.classLevel,
        language: c.language,
        level: c.level,
        thumbnailUrl: c.thumbnailUrl,
        instructorName: c.instructorName,
        isFeatured: c.isFeatured,
        subject: c.subject,
        lessonCount: c._count.lessons,
        enrollmentCount: c._count.enrollments,
      }))
    );
  });
}
