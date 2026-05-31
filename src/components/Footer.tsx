import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-base font-black text-white">
              ∞
            </span>
            <span className="font-extrabold text-slate-900">
              Infinity<span className="text-brand-600">BSEB</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            Concept-first learning for Bihar Board students, Class 1 to 12. Learn at your pace,
            track your progress, ace your boards.
          </p>
        </div>

        <FooterCol
          title="Learn"
          links={[
            { label: "Browse Classes", href: "/classes" },
            { label: "All Courses", href: "/courses" },
            { label: "Class 10 Board", href: "/classes/10" },
            { label: "Class 12 Board", href: "/classes/12" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { label: "Sign up", href: "/register" },
            { label: "Log in", href: "/login" },
            { label: "My Dashboard", href: "/dashboard" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "About", href: "/" },
            { label: "Contact", href: "/" },
            { label: "Privacy", href: "/" },
          ]}
        />
      </div>
      <div className="border-t border-slate-200 py-6">
        <p className="container-page text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Infinity BSEB Learn. Built as an MVP demo. Not affiliated
          with the Bihar School Examination Board.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-slate-500 hover:text-brand-600">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
