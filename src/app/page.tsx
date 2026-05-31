import Link from "next/link";
import { getFeaturedCourses, getClassOverview, getPlatformStats } from "@/lib/queries";
import { CourseCard } from "@/components/CourseCard";
import { ClassCard } from "@/components/ClassCard";

export default async function HomePage() {
  const [featured, classes, stats] = await Promise.all([
    getFeaturedCourses(6),
    getClassOverview(),
    getPlatformStats(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_0%,white,transparent_35%)]" />
        <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="badge bg-white/15 text-white ring-1 ring-white/25">
              🎓 Built for Bihar Board (BSEB) · Class 1–12
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Learn smarter.<br />Score higher in your{" "}
              <span className="text-accent-400">boards.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-brand-100">
              Concept-first video lessons, structured chapter-wise courses and progress tracking —
              all aligned to the BSEB syllabus. Start free, learn at your own pace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-accent text-base">
                Start learning free
              </Link>
              <Link
                href="/classes"
                className="btn text-base bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20"
              >
                Browse classes
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <Stat value={`${stats.courses}+`} label="Courses" />
              <Stat value={`${stats.lessons}+`} label="Video lessons" />
              <Stat value="12" label="Classes" />
              <Stat value={`${stats.subjects}+`} label="Subjects" />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
              <div className="aspect-video rounded-2xl bg-slate-900/60 p-6">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 rounded bg-white/30" />
                    <div className="h-3 w-1/2 rounded bg-white/20" />
                    <div className="flex gap-2 pt-2">
                      <span className="badge bg-accent-500 text-white">▶ Class 10 · Science</span>
                      <span className="badge bg-white/20 text-white">85% complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon="🎯"
            title="Syllabus-aligned"
            desc="Every course maps to the BSEB curriculum, chapter by chapter — no guesswork."
          />
          <Feature
            icon="🎬"
            title="Learn by video"
            desc="Bite-sized video lessons streamed from a global CDN. Watch anywhere, on any device."
          />
          <Feature
            icon="📈"
            title="Track progress"
            desc="Mark lessons complete, resume where you left off, and watch your mastery grow."
          />
        </div>
      </section>

      {/* Browse by class */}
      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            title="Choose your class"
            subtitle="From foundational primary years to board-exam classes — pick your grade to begin."
            href="/classes"
            cta="View all"
          />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {classes.map((c) => (
              <ClassCard
                key={c.classLevel}
                classLevel={c.classLevel}
                subjectCount={c.subjectCount}
                courseCount={c.courseCount}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading
            title="Featured courses"
            subtitle="Popular board-exam courses to kickstart your preparation."
            href="/courses"
            cta="All courses"
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard
                key={c.id}
                slug={c.slug}
                title={c.title}
                classLevel={c.classLevel}
                level={c.level}
                language={c.language}
                thumbnailUrl={c.thumbnailUrl}
                instructorName={c.instructorName}
                lessonCount={c._count.lessons}
                enrollmentCount={c._count.enrollments}
                subject={c.subject}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="container-page flex flex-col items-center text-center">
          <h2 className="text-3xl font-extrabold">Ready to start learning?</h2>
          <p className="mt-3 max-w-xl text-slate-300">
            Join thousands of Bihar Board students learning the smart way. It&apos;s free to begin.
          </p>
          <Link href="/register" className="btn-accent mt-6 text-base">
            Create your free account
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-brand-200">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">{icon}</div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  href,
  cta,
}: {
  title: string;
  subtitle: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>
      </div>
      <Link href={href} className="hidden shrink-0 text-sm font-semibold text-brand-600 hover:underline sm:block">
        {cta} →
      </Link>
    </div>
  );
}
