import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle, ok, fail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/subjects?class=10  -> subjects (with course counts) for a class level
export async function GET(req: NextRequest) {
  return handle(async () => {
    const classParam = req.nextUrl.searchParams.get("class");
    const classLevel = classParam ? Number(classParam) : null;

    if (classParam && (Number.isNaN(classLevel!) || classLevel! < 1 || classLevel! > 12)) {
      return fail("class must be an integer between 1 and 12", 422);
    }

    const subjects = await prisma.subject.findMany({
      where: classLevel ? { classLevel } : undefined,
      orderBy: [{ classLevel: "asc" }, { name: "asc" }],
      include: { _count: { select: { courses: true } } },
    });

    return ok(
      subjects.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        colorHex: s.colorHex,
        classLevel: s.classLevel,
        description: s.description,
        courseCount: s._count.courses,
      }))
    );
  });
}
