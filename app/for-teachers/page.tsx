"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const teacherFeatures = [
  {
    title: "Smart Automated Grading",
    desc: "Grade handwritten exams, multiple choice, and essays in seconds with detailed constructive feedback.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
    bg: "bg-purple-50/50 border-purple-100",
  },
  {
    title: "AI Lesson Planning",
    desc: "Generate curriculum-aligned lesson plans, quiz sets, and interactive worksheets in seconds.",
    icon: (
      <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    ),
    bg: "bg-blue-50/50 border-blue-100",
  },
  {
    title: "Curriculum & Resource Repository",
    desc: "Store, organize, and share teaching materials, rubrics, and digital assets seamlessly across classes.",
    icon: (
      <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    bg: "bg-indigo-50/50 border-indigo-100",
  },
  {
    title: "Classroom Insights & Analytics",
    desc: "Real-time visual dashboards revealing student engagement, comprehension gaps, and top strengths.",
    icon: (
      <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    bg: "bg-emerald-50/50 border-emerald-100",
  },
  {
    title: "Instant Parent Communication",
    desc: "Direct, translated messaging and automated progress notifications for parents with zero hassle.",
    icon: (
      <svg className="w-6 h-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    bg: "bg-rose-50/50 border-rose-100",
  },
  {
    title: "Automated Attendance & Safety",
    desc: "Fast digital roll call, automatic absence SMS/push alerts, and effortless hall pass tracking.",
    icon: (
      <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    bg: "bg-amber-50/50 border-amber-100",
  },
];

const teacherStats = [
  { value: "10+", label: "Hours Saved Weekly", desc: "Less paperwork and grading" },
  { value: "95%", label: "Grading Accuracy", desc: "Aligned with your custom rubrics" },
  { value: "23%", label: "Improved Student Scores", desc: "Faster feedback loops" },
  { value: "4.9/5", label: "Educator Rating", desc: "Loved by teachers globally" },
];

const testimonials = [
  {
    quote: "Jinni reduced my grading time by 80%. I used to spend my entire Sunday grading biology essays; now I review AI-graded rubrics in 30 minutes.",
    author: "Elena Rostova",
    role: "AP Biology Teacher, Oakridge Academy",
  },
  {
    quote: "The automated lesson planner creates engaging classroom quizzes and exercises in seconds. It allows me to personalize lessons for every student.",
    author: "Marcus Chen",
    role: "Mathematics Department Head, Summit High",
  },
  {
    quote: "Parents love the instant feedback and translated messages. My parent-teacher conferences are now celebrating progress rather than catching up on delays.",
    author: "Sarah Jenkins",
    role: "Middle School Educator, Horizons School",
  },
];

export default function ForTeachersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="gradient-orb gradient-orb-1 -top-20 -left-20" />

        <div className="section-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#5b4dfb] text-xs font-bold uppercase tracking-wider mb-6">
                <span>FOR TEACHERS</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-950 leading-[1.12] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Focus on <span className="text-[#5b4dfb]">Teaching</span>, Not the Work Around It.
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
                Jinni empowers educators with AI-driven grading, instant lesson planning, real-time classroom insights, and automated administrative tasks so you can do what you love most: inspire students.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#5b4dfb] hover:bg-[#4c3ce6] text-white font-bold rounded-full shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Free Trial</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/ai-assistant"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-full border border-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>Watch Demo</span>
                </Link>
              </div>
            </div>

            {/* Right Mascot Visual */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border border-indigo-100/60 bg-gradient-to-b from-indigo-50/40 to-white p-4 sm:p-6 flex items-center justify-center">
                <Image
                  src="/images/genie.png"
                  alt="Jinni Teacher Assistant Mascot"
                  width={380}
                  height={380}
                  className="w-full max-w-[240px] sm:max-w-[300px] md:max-w-[360px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 360px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid: Everything a Modern Educator Needs */}
      <section className="py-24 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#5b4dfb] text-xs font-bold uppercase tracking-wider mb-4">
              <span>FEATURES</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Everything a <span className="text-[#5b4dfb]">Modern Educator</span> Needs
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Designed with teachers, for teachers. Eliminate repetitive administrative burdens and gain hours back every week.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teacherFeatures.map((f) => (
              <div
                key={f.title}
                className={`p-7 rounded-3xl border bg-white shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${f.bg}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-100 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2.5" style={{ fontFamily: "var(--font-heading)" }}>
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

      {/* Feature Highlight: Grade 100 Papers in Minutes */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#5b4dfb] text-xs font-bold uppercase tracking-wider mb-5">
                <span>AI GRADING</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Grade 100 Papers in <span className="text-[#5b4dfb]">Minutes</span>, Not Hours
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
                Jinni&apos;s OCR & AI engine scans physical and digital assignments, applies your custom rubrics, provides constructive feedback, and syncs directly with your gradebook.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Instant OCR handwriting recognition",
                  "Rubric-aligned constructive feedback",
                  "Bulk grading with one click",
                  "Gradebook auto-sync & LMS export",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-base text-gray-800 font-medium">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-[#5b4dfb] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#5b4dfb] hover:bg-[#4c3ce6] text-white font-bold rounded-full shadow-lg shadow-indigo-500/25 transition-all group"
              >
                <span>Explore AI Grading Suite</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-6">
              <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <Image
                  src="/images/teachers_group.jpg"
                  alt="Faculty & Teachers Team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {teacherStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#5b4dfb] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#5b4dfb] text-xs font-bold uppercase tracking-wider mb-4">
              <span>TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950" style={{ fontFamily: "var(--font-heading)" }}>
              Teachers <span className="text-[#5b4dfb]">Love</span> Jinni
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.author} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-shadow">
                <div>
                  <div className="text-amber-400 text-lg mb-4">★★★★★</div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{t.author}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Informational SEO Guide */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            AI Teaching Tools Inside One School Management Platform
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
            Traditional school administrative tools were built decades ago to store records, not to support teachers in their daily instructional workflows. Jinni changes that paradigm by placing artificial intelligence right where educators need it most.
          </p>
          <div className="bg-white p-8 rounded-3xl border border-gray-200/80 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">How Jinni helps teachers:</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <span className="text-[#5b4dfb] font-bold">•</span>
                <span><strong>Instant Feedback Loops:</strong> Return graded assignments within hours rather than weeks, dramatically boosting student retention.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#5b4dfb] font-bold">•</span>
                <span><strong>Curriculum Alignment:</strong> Generate standards-compliant rubric assessments and question banks with one click.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#5b4dfb] font-bold">•</span>
                <span><strong>Classroom Equity:</strong> Identify quiet students falling behind before midterm exam results arrive.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4f3df5] via-[#4332e6] to-[#7c3aed] rounded-3xl p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="max-w-xl z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Ready to <span className="text-pink-300">Transform</span> Your Teaching?
              </h2>
              <p className="text-indigo-100 text-base mb-8">
                Join 20,000+ educators streamlining their classrooms and taking back their personal time today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="px-8 py-3.5 bg-white text-[#5b4dfb] font-bold rounded-full hover:bg-gray-100 transition-colors">
                  Start Free Trial
                </Link>
                <Link href="/contact" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/20 transition-colors">
                  Schedule a Demo
                </Link>
              </div>
            </div>

            <div className="flex-shrink-0 z-10 flex items-center justify-center">
              <Image
                src="/images/genie.png"
                alt="Jinni Mascot"
                width={260}
                height={260}
                className="w-36 h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 240px"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
