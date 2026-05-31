import type { Metadata } from "next";
import { getClassOverview } from "@/lib/queries";
import { ClassCard } from "@/components/ClassCard";
import { stageForClass } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Browse Classes",
  description: "Browse BSEB courses by class, from Class 1 to Class 12.",
};

export default async function ClassesPage() {
  const classes = await getClassOverview();

  const stages = [
    { name: "Primary", range: [1, 5] },
    { name: "Middle", range: [6, 8] },
    { name: "Secondary", range: [9, 10] },
    { name: "Senior Secondary", range: [11, 12] },
  ];

  return (
    <div className="container-page py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Browse by class</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Pick your grade to see every subject and course tailored to the BSEB syllabus.
        </p>
      </header>

      {stages.map((stage) => (
        <section key={stage.name} className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">{stage.name}</h2>
            <span className="badge bg-slate-100 text-slate-500">
              Class {stage.range[0]}–{stage.range[1]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {classes
              .filter((c) => c.classLevel >= stage.range[0] && c.classLevel <= stage.range[1])
              .map((c) => (
                <ClassCard
                  key={c.classLevel}
                  classLevel={c.classLevel}
                  subjectCount={c.subjectCount}
                  courseCount={c.courseCount}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
