import { prisma } from "@/lib/prisma";

// Server-side data helpers. Used directly by Server Components (no HTTP hop).
// The /api/* routes mirror these for client-side + external consumers.

export async function getFeaturedCourses(take = 6) {
  return prisma.course.findMany({
    where: { isFeatured: true },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      subject: { select: { name: true, icon: true, colorHex: true, slug: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  });
}

export async function getClassOverview() {
  // Aggregate subject + course counts per class level for the /classes grid.
  const grouped = await prisma.subject.groupBy({
    by: ["classLevel"],
    _count: { _all: true },
  });
  const courseGrouped = await prisma.course.groupBy({
    by: ["classLevel"],
    _count: { _all: true },
  });

  const subjectMap = new Map(grouped.map((g) => [g.classLevel, g._count._all]));
  const courseMap = new Map(courseGrouped.map((g) => [g.classLevel, g._count._all]));

  return Array.from({ length: 12 }, (_, i) => {
    const classLevel = i + 1;
    return {
      classLevel,
      subjectCount: subjectMap.get(classLevel) ?? 0,
      courseCount: courseMap.get(classLevel) ?? 0,
    };
  });
}

export async function getSubjectsForClass(classLevel: number) {
  return prisma.subject.findMany({
    where: { classLevel },
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });
}

export async function getCoursesForClass(classLevel: number) {
  return prisma.course.findMany({
    where: { classLevel },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      subject: { select: { name: true, icon: true, colorHex: true, slug: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      subject: { select: { name: true, slug: true, icon: true, colorHex: true } },
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });
}

export async function getEnrollmentState(userId: string, courseId: string) {
  const [enrollment, completed] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, completed: true, lesson: { courseId } },
      select: { lessonId: true },
    }),
  ]);
  return {
    enrolled: Boolean(enrollment),
    completedLessonIds: completed.map((c) => c.lessonId),
  };
}

export async function getMyEnrollments(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
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
    where: { userId, completed: true },
    select: { lesson: { select: { courseId: true } } },
  });
  const completedByCourse = new Map<string, number>();
  for (const p of completed) {
    const cid = p.lesson.courseId;
    completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
  }

  return enrollments.map((e) => {
    const total = e.course._count.lessons;
    const done = completedByCourse.get(e.courseId) ?? 0;
    return {
      enrolledAt: e.createdAt,
      course: e.course,
      lessonCount: total,
      completedCount: done,
      progressPct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });
}

export async function getPlatformStats() {
  const [courses, lessons, subjects] = await Promise.all([
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.subject.count(),
  ]);
  return { courses, lessons, subjects, classes: 12 };
}
