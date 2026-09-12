"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const studentFeatures = [
  {
    title: "Homework & Assignments",
    desc: "Submit assignments digitally, track upcoming due dates, and get instant feedback with clear scoring rubrics.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
    bg: "bg-purple-50/50 border-purple-100",
  },
  {
    title: "Interactive Study Notes",
    desc: "Access organized lecture summaries, interactive flashcards, and searchable class materials anytime.",
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
    title: "Class Forum & Discussions",
    desc: "Collaborate on homework problems, ask peer questions, and participate in subject forums safely.",
    icon: (
      <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    bg: "bg-indigo-50/50 border-indigo-100",
  },
  {
    title: "Attendance Tracker",
    desc: "Real-time calendar tracking your daily presence, leaves, school events, and timetable changes.",
    icon: (
      <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    bg: "bg-emerald-50/50 border-emerald-100",
  },
  {
    title: "Performance & Grades",
    desc: "Visual trend charts mapping your grades across every subject with personalized tips to boost scores.",
    icon: (
      <svg className="w-6 h-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    bg: "bg-rose-50/50 border-rose-100",
  },
  {
    title: "24/7 AI Tutor & Mentor",
    desc: "Stuck on a tricky concept at 10 PM? Ask your AI tutor for step-by-step hints and practice questions.",
    icon: (
      <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    bg: "bg-amber-50/50 border-amber-100",
  },
];

const learningStyles = [
  {
    title: "Visual Learner",
    desc: "Interactive visual diagrams, concept maps, and color-coded notes.",
    icon: "🎨",
    bg: "bg-blue-50/50 border-blue-100",
  },
  {
    title: "Practice Driven",
    desc: "Targeted step-by-step problem sets, drills, and practice quizzes.",
    icon: "⚡",
    bg: "bg-purple-50/50 border-purple-100",
  },
  {
    title: "Deep Diver",
    desc: "In-depth conceptual breakdowns, proofs, and real-world examples.",
    icon: "🔬",
    bg: "bg-indigo-50/50 border-indigo-100",
  },
  {
    title: "Flashcard Sprint",
    desc: "Spaced repetition flashcards designed to lock key terms into long-term memory.",
    icon: "🗂️",
    bg: "bg-pink-50/50 border-pink-100",
  },
  {
    title: "Voice & Audio",
    desc: "Listen to narrated audio chapter recaps during walks or commutes.",
    icon: "🎧",
    bg: "bg-amber-50/50 border-amber-100",
  },
  {
    title: "Collaborative Study",
    desc: "Join peer challenge rooms, quiz leaderboards, and study groups.",
    icon: "👥",
    bg: "bg-emerald-50/50 border-emerald-100",
  },
];

export default function ForStudentsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="gradient-orb gradient-orb-2 top-20 -right-20" />

        <div className="section-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Mascot Visual Left */}
            <div className="lg:col-span-5 order-2 lg:order-1 relative flex justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border border-indigo-100/60 bg-gradient-to-b from-purple-50/40 to-white p-4 sm:p-6 flex items-center justify-center">
                <Image
                  src="/images/genie.png"
                  alt="Jinni Student Mascot"
                  width={380}
                  height={380}
                  className="w-full max-w-[240px] sm:max-w-[300px] md:max-w-[360px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 360px"
                  priority
                />
              </div>
            </div>

            {/* Content Right */}
            <div className="lg:col-span-7 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-xs font-bold uppercase tracking-wider mb-6">
                <span>FOR STUDENTS</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-950 leading-[1.12] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                For Every Student, From <span className="text-[#7c3aed]">Catching Up</span> to <span className="text-[#5b4dfb]">Getting Ahead.</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
                Your personalized AI study companion and academic dashboard in one place. Master subjects at your own pace with tailored explanations, interactive practice, and instant help.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-full shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Learning Free</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/ai-assistant"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-full border border-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>See How It Works</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything at Your Fingertips */}
      <section className="py-24 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-xs font-bold uppercase tracking-wider mb-4">
              <span>STUDENT DASHBOARD</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Everything at Your <span className="text-[#7c3aed]">Fingertips</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              No more messy binders or forgotten deadlines. All your coursework, grades, and study tools in one slick interface.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {studentFeatures.map((f) => (
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

      {/* Personalized Learning Paths Just for You */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-xs font-bold uppercase tracking-wider mb-5">
                <span>ADAPTIVE AI</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Personalized Learning Paths <span className="text-[#7c3aed]">Just for You</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
                Jinni&apos;s adaptive AI tutor adapts to your strengths, identifies what topics need review, and generates tailored practice questions before exams.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Adaptive difficulty matching based on your skill level",
                  "Real-time hints and conceptual breakdowns",
                  "Gamified streak rewards and mastery badges",
                  "Comprehensive exam readiness predictions",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-base text-gray-800 font-medium">
                    <div className="w-6 h-6 rounded-full bg-purple-50 text-[#7c3aed] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-full shadow-lg shadow-purple-500/25 transition-all group"
              >
                <span>Explore AI Tutor</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right Student 3D Illustration */}
            <div className="lg:col-span-6">
              <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white flex items-center justify-center p-2 sm:p-4">
                <Image
                  src="/images/student_study.jpg"
                  alt="Student Studying with AI Tutor"
                  width={800}
                  height={600}
                  className="w-full h-full object-contain rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored to Your Learning Style */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-xs font-bold uppercase tracking-wider mb-4">
              <span>LEARNING STYLES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950" style={{ fontFamily: "var(--font-heading)" }}>
              Tailored to <span className="text-[#7c3aed]">Your Learning Style</span>
            </h2>
            <p className="text-base text-gray-600 mt-2">
              Learn the way that fits your brain best with multi-modal AI explanations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {learningStyles.map((style) => (
              <div key={style.title} className={`p-6 rounded-3xl bg-white border shadow-xs hover:shadow-lg transition-all ${style.bg}`}>
                <div className="text-3xl mb-4">{style.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{style.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{style.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Information & Value Guide */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            A Learning Management System Students Actually Enjoy
          </h2>
          <div className="bg-slate-50 p-8 rounded-3xl border border-gray-200/80 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What students get with Jinni:</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <span className="text-[#7c3aed] font-bold">•</span>
                <span><strong>No More Homework Stress:</strong> AI hints break complex math & science problems into simple steps without giving away answers directly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#7c3aed] font-bold">•</span>
                <span><strong>Exam Readiness:</strong> Practice with realistic mock tests generated from your exact class curriculum.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#7c3aed] font-bold">•</span>
                <span><strong>Direct Teacher Chat:</strong> Clear doubts directly with your subject teachers through built-in safe channels.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#7c3aed] via-[#6d28d9] to-[#4f3df5] rounded-3xl p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="max-w-xl z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Start Your <span className="text-pink-300">Learning Journey</span> Today
              </h2>
              <p className="text-indigo-100 text-base mb-8">
                Join thousands of students mastering their subjects faster with AI study superpowers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="px-8 py-3.5 bg-white text-[#7c3aed] font-bold rounded-full hover:bg-gray-100 transition-colors">
                  Get Started Free
                </Link>
                <Link href="/ai-assistant" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/20 transition-colors">
                  Talk to AI Tutor
                </Link>
              </div>
            </div>

            <div className="flex-shrink-0 z-10 flex items-center justify-center">
              <Image
                src="/images/genie.png"
                alt="Jinni Student Mascot"
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
