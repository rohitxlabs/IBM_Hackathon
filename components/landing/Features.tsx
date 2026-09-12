"use client";

const aiFeatures = [
  {
    title: "AI Automated Grading",
    desc: "Evaluate handwritten papers, essay assignments, and tests with rubric-aligned accuracy and instant constructive feedback.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
    badge: "Grading Engine",
    bgColor: "bg-purple-50/60 border-purple-100 hover:border-purple-300",
    iconBg: "bg-purple-100",
  },
  {
    title: "Smart Lesson Planning",
    desc: "Generate curriculum-aligned interactive lesson plans, quiz sets, and flashcards in seconds customized for every grade.",
    icon: (
      <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    ),
    badge: "Curriculum AI",
    bgColor: "bg-blue-50/60 border-blue-100 hover:border-blue-300",
    iconBg: "bg-blue-100",
  },
  {
    title: "Intelligent Attendance & Safety",
    desc: "Digital roll-call with automated parent notifications, bus GPS integration, and real-time attendance trends.",
    icon: (
      <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    badge: "Safety Hub",
    bgColor: "bg-emerald-50/60 border-emerald-100 hover:border-emerald-300",
    iconBg: "bg-emerald-100",
  },
  {
    title: "Predictive Student Analytics",
    desc: "Identify comprehension bottlenecks early and recommend tailored learning pathways before exams.",
    icon: (
      <svg className="w-6 h-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    badge: "Early Warning",
    bgColor: "bg-rose-50/60 border-rose-100 hover:border-rose-300",
    iconBg: "bg-rose-100",
  },
  {
    title: "Automated Communication Hub",
    desc: "Seamless parent-teacher messaging with one-click multi-language translation and instant emergency broadcasts.",
    icon: (
      <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    badge: "Omnichannel",
    bgColor: "bg-indigo-50/60 border-indigo-100 hover:border-indigo-300",
    iconBg: "bg-indigo-100",
  },
  {
    title: "Smart Fee & Financial Management",
    desc: "Automated billing, instant online payments, scheduled parent reminders, and comprehensive audit reports.",
    icon: (
      <svg className="w-6 h-6 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
    badge: "Finance AI",
    bgColor: "bg-cyan-50/60 border-cyan-100 hover:border-cyan-300",
    iconBg: "bg-cyan-100",
  },
];

export function Features() {
  return (
    <section className="section bg-white py-24">
      <div className="section-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#5b4dfb] text-xs font-bold uppercase tracking-wider mb-4">
            <span>AI SUPERPOWERS</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            AI-Powered Tools built to Empower Modern Schools
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Transform everyday administrative and academic tasks into intelligent, high-speed automated workflows.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {aiFeatures.map((f) => (
            <div
              key={f.title}
              className={`p-7 rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${f.bgColor}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.iconBg} shadow-xs`}>
                  {f.icon}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white rounded-full border border-gray-100 text-gray-700 shadow-xs">
                  {f.badge}
                </span>
              </div>
              <h3
                className="text-xl font-bold text-gray-900 mb-2.5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
