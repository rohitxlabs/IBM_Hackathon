import Link from "next/link";

const roles = [
  {
    role: "For Teachers",
    color: "teacher",
    borderClass: "border-[var(--teacher-border)]",
    shadowClass: "hover:shadow-[0_8px_32px_-8px_var(--teacher-shadow)]",
    accentClass: "text-[var(--teacher-accent)]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    features: [
      "Smart homework assignment & grading",
      "Automated test evaluation with AI",
      "Performance analytics dashboard",
      "AI-powered personalized teaching",
      "Class notes management",
    ],
    href: "/for-teachers",
  },
  {
    role: "For Students",
    color: "student",
    borderClass: "border-[var(--student-border)]",
    shadowClass: "hover:shadow-[0_8px_32px_-8px_var(--student-shadow)]",
    accentClass: "text-[var(--student-accent)]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    features: [
      "Course library access",
      "Digital class notes",
      "Homework submission portal",
      "24/7 AI mentor support",
      "PTM & notice board access",
    ],
    href: "/for-students",
  },
  {
    role: "For Parents",
    color: "parent",
    borderClass: "border-[var(--parent-border)]",
    shadowClass: "hover:shadow-[0_8px_32px_-8px_var(--parent-shadow)]",
    accentClass: "text-[var(--parent-accent)]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    features: [
      "Real-time progress tracking",
      "Attendance notifications",
      "Report card access",
      "PTM scheduling",
      "School announcements",
    ],
    href: "/for-parents",
  },
];

export function Stakeholders() {
  return (
    <section className="section bg-[var(--surface)]">
      <div className="section-inner">
        <div className="text-center mb-16">
          <span className="badge mb-4 inline-flex">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Built for Everyone
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Tailored for <span className="gradient-text">Every Role</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Whether you are a teacher, student, or parent — Jinni has the tools you need to succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.role}
              className={`card border-2 ${role.borderClass} ${role.shadowClass} transition-all duration-300`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${role.accentClass} bg-gradient-to-br from-white to-gray-50 border border-gray-100`}>
                {role.icon}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                {role.role}
              </h3>
              <ul className="space-y-2.5 mb-6">
                {role.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${role.accentClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={role.href}
                className={`inline-flex items-center gap-2 text-sm font-semibold ${role.accentClass} group`}
              >
                Explore {role.role.replace("For ", "")} Features
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
