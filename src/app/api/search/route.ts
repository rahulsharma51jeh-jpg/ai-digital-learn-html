import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/search?q=algebra -> courses + subjects matching the query
export async function GET(req: NextRequest) {
  return handle(async () => {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    if (q.length < 2) return ok({ courses: [], subjects: [] });

    const [courses, subjects] = await Promise.all([
      prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { subject: { name: { contains: q } } },
          ],
        },
        take: 12,
        include: { subject: { select: { name: true, icon: true, colorHex: true } } },
        orderBy: { isFeatured: "desc" },
      }),
      prisma.subject.findMany({
        where: { name: { contains: q } },
        take: 8,
        orderBy: { classLevel: "asc" },
      }),
    ]);

    return ok({
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        classLevel: c.classLevel,
        subject: c.subject,
      })),
      subjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        classLevel: s.classLevel,
      })),
    });
  });
}
