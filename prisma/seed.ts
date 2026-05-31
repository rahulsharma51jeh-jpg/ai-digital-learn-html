/**
 * Infinity BSEB Learn — database seed
 * ------------------------------------
 * Generates a realistic BSEB catalog for classes 1–12:
 *   - Subjects appropriate to each stage (primary / middle / secondary / senior)
 *   - One starter course per subject
 *   - 4 video lessons per course (sourced from YouTube)
 *   - A demo student + an admin account
 *
 * NOTE ON VIDEOS: the youtubeVideoId values below are an illustrative,
 * rotating pool of educational clips for the MVP demo. In production these
 * are managed by instructors/admin via the content pipeline.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Illustrative pool of educational YouTube video IDs (replaced via admin in prod).
const VIDEO_POOL = [
  "WUvTyaaNkzM",
  "fNk_zzaMoSs",
  "rfscVS0vtbw",
  "kqtD5dpn9C8",
  "PkZNo7MFNFg",
  "8mAITcNt710",
  "Zot9oz0Yfp4",
  "OmJ-4B-mS-Y",
  "HcOc7P5BMi4",
  "nKIu9yen5nc",
  "rdwz7QiG0lk",
  "lTRiuFIWV54",
  "_uQrJ0TkZlc",
  "yfoY53QXEnI",
  "GwIo3gDZCVQ",
];

const THUMBS = [
  "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=640&q=80",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&q=80",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=640&q=80",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=640&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=640&q=80",
];

type SubjectDef = { name: string; icon: string; colorHex: string };

const PRIMARY: SubjectDef[] = [
  { name: "Hindi", icon: "📕", colorHex: "#ef4444" },
  { name: "English", icon: "📗", colorHex: "#22c55e" },
  { name: "Mathematics", icon: "🔢", colorHex: "#4f46e5" },
  { name: "Environmental Studies", icon: "🌱", colorHex: "#10b981" },
  { name: "General Knowledge", icon: "🧠", colorHex: "#f59e0b" },
];

const MIDDLE: SubjectDef[] = [
  { name: "Hindi", icon: "📕", colorHex: "#ef4444" },
  { name: "English", icon: "📗", colorHex: "#22c55e" },
  { name: "Mathematics", icon: "🔢", colorHex: "#4f46e5" },
  { name: "Science", icon: "🔬", colorHex: "#06b6d4" },
  { name: "Social Science", icon: "🌏", colorHex: "#f97316" },
  { name: "Sanskrit", icon: "🕉️", colorHex: "#a855f7" },
];

const SECONDARY: SubjectDef[] = [
  { name: "Hindi", icon: "📕", colorHex: "#ef4444" },
  { name: "English", icon: "📗", colorHex: "#22c55e" },
  { name: "Mathematics", icon: "🔢", colorHex: "#4f46e5" },
  { name: "Science", icon: "🔬", colorHex: "#06b6d4" },
  { name: "Social Science", icon: "🌏", colorHex: "#f97316" },
  { name: "Sanskrit", icon: "🕉️", colorHex: "#a855f7" },
];

const SENIOR: SubjectDef[] = [
  { name: "Physics", icon: "⚛️", colorHex: "#4f46e5" },
  { name: "Chemistry", icon: "🧪", colorHex: "#14b8a6" },
  { name: "Biology", icon: "🧬", colorHex: "#22c55e" },
  { name: "Mathematics", icon: "🔢", colorHex: "#6366f1" },
  { name: "English", icon: "📗", colorHex: "#84cc16" },
  { name: "Hindi", icon: "📕", colorHex: "#ef4444" },
  { name: "Accountancy", icon: "📊", colorHex: "#f59e0b" },
  { name: "Business Studies", icon: "💼", colorHex: "#0ea5e9" },
  { name: "Economics", icon: "📈", colorHex: "#ec4899" },
];

function subjectsForClass(classLevel: number): SubjectDef[] {
  if (classLevel <= 5) return PRIMARY;
  if (classLevel <= 8) return MIDDLE;
  if (classLevel <= 10) return SECONDARY;
  return SENIOR;
}

function slugify(...parts: (string | number)[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

async function main() {
  console.log("🌱 Seeding Infinity BSEB Learn...");

  // Clean slate (order matters for FK constraints).
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const studentPass = await bcrypt.hash("password123", 10);
  const adminPass = await bcrypt.hash("admin12345", 10);

  const student = await prisma.user.create({
    data: {
      name: "Demo Student",
      email: "student@infinitybseb.in",
      passwordHash: studentPass,
      role: "STUDENT",
      classLevel: 10,
    },
  });

  await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@infinitybseb.in",
      passwordHash: adminPass,
      role: "ADMIN",
    },
  });

  let videoCursor = 0;
  let thumbCursor = 0;
  let courseCount = 0;
  let lessonCount = 0;
  const featuredCourseIds: string[] = [];

  for (let classLevel = 1; classLevel <= 12; classLevel++) {
    const subjects = subjectsForClass(classLevel);

    for (const def of subjects) {
      const subject = await prisma.subject.create({
        data: {
          name: def.name,
          slug: slugify(def.name, "class", classLevel),
          icon: def.icon,
          colorHex: def.colorHex,
          classLevel,
          description: `${def.name} for BSEB Class ${classLevel} — concept-first video lessons aligned to the Bihar Board syllabus.`,
        },
      });

      const level =
        classLevel <= 5 ? "Beginner" : classLevel <= 10 ? "Intermediate" : "Advanced";
      const isFeatured = (classLevel === 10 || classLevel === 12) && courseCount % 3 === 0;

      const course = await prisma.course.create({
        data: {
          title: `${def.name} — Complete Class ${classLevel}`,
          slug: slugify(def.name, "complete", "class", classLevel),
          description: `Master ${def.name} for BSEB Class ${classLevel}. Full chapter-wise video course with examples, board-exam tips and revision.`,
          classLevel,
          language: classLevel >= 11 ? "Hinglish" : "Hindi",
          level,
          thumbnailUrl: pick(THUMBS, thumbCursor++),
          instructorName: "Infinity Faculty",
          isFeatured,
          subjectId: subject.id,
        },
      });
      courseCount++;
      if (isFeatured) featuredCourseIds.push(course.id);

      const lessonTitles = [
        `Introduction & Syllabus Overview`,
        `Core Concepts — Part 1`,
        `Core Concepts — Part 2`,
        `Board Exam Practice & Revision`,
      ];

      for (let i = 0; i < lessonTitles.length; i++) {
        await prisma.lesson.create({
          data: {
            title: `${lessonTitles[i]}`,
            description: `${def.name} (Class ${classLevel}) — ${lessonTitles[i]}.`,
            youtubeVideoId: pick(VIDEO_POOL, videoCursor++),
            durationSeconds: 480 + ((i * 137) % 900),
            order: i + 1,
            isFreePreview: i === 0, // first lesson free to preview
            courseId: course.id,
          },
        });
        lessonCount++;
      }
    }
  }

  // Enroll the demo student in a couple of Class 10 courses + sample progress.
  const class10Courses = await prisma.course.findMany({
    where: { classLevel: 10 },
    include: { lessons: { orderBy: { order: "asc" } } },
    take: 3,
  });

  for (const c of class10Courses) {
    await prisma.enrollment.create({
      data: { userId: student.id, courseId: c.id },
    });
    // Mark first lesson completed for the first enrolled course.
    if (c.lessons[0]) {
      await prisma.lessonProgress.create({
        data: {
          userId: student.id,
          lessonId: c.lessons[0].id,
          completed: true,
          watchedSeconds: c.lessons[0].durationSeconds,
        },
      });
    }
  }

  console.log(
    `✅ Done. Subjects+Courses: ${courseCount}, Lessons: ${lessonCount}, Featured: ${featuredCourseIds.length}`
  );
  console.log("👤 Demo student: student@infinitybseb.in / password123");
  console.log("🛠️  Admin:        admin@infinitybseb.in / admin12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
