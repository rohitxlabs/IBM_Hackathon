"use client";

import Link from "next/link";

const comparisons = [
  {
    feature: "AI Automated Grading & Feedback",
    Jinni: "Instant OCR, handwriting recognition & rubric feedback in seconds",
    legacy: "Manual grading, takes 10+ hours weekly with delayed feedback",
    JinniStatus: true,
  },
  {
    feature: "Unified Stakeholder Experience",
    Jinni: "Integrated real-time portal for Admins, Teachers, Students & Parents",
    legacy: "Fragmented systems with separate logins and no synchronization",
    JinniStatus: true,
  },
  {
    feature: "24/7 Personalized AI Study Mentor",
    Jinni: "Adaptive explanations, interactive quizzes & custom study roadmaps",
    legacy: "Static PDF downloads with zero interactive learning assistance",
    JinniStatus: true,
  },
  {
    feature: "Attendance & Safety Automation",
    Jinni: "One-tap digital roll call with instant multi-channel parent alerts",
    legacy: "Paper registers with slow manual follow-ups",
    JinniStatus: true,
  },
  {
    feature: "Predictive Academic Insights",
    Jinni: "Early warning detection for comprehension gaps before major exams",
    legacy: "Retroactive report cards when it's already too late",
    JinniStatus: true,
  },
  {
    feature: "Modern Cloud Architecture",
    Jinni: "Fast mobile apps, 99.9% uptime, bank-grade encryption",
    legacy: "Slow on-premise servers requiring manual IT maintenance",
    JinniStatus: true,
  },
];

export function Comparison() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#312e81] via-[#1e1b4b] to-[#0f172a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
            <span>THE MODERN ADVANTAGE</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Why Modern Schools Choose Us Over Legacy Portals
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            See how Jinni replaces outdated, fragmented school systems with one intelligent, seamless platform.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-white/[0.03] backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/10 bg-white/[0.06] p-5 text-sm font-bold uppercase tracking-wider text-slate-300">
            <div className="md:col-span-4">Capability</div>
            <div className="md:col-span-4 text-indigo-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5b4dfb]" />
              Jinni Platform
            </div>
            <div className="md:col-span-4 text-slate-400">Traditional Legacy Software</div>
          </div>

          <div className="divide-y divide-white/10">
            {comparisons.map((item) => (
              <div key={item.feature} className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                <div className="md:col-span-4 font-semibold text-white text-base">
                  {item.feature}
                </div>
                <div className="md:col-span-4 flex items-start gap-3 text-sm text-indigo-100 bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/20">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    ✓
                  </div>
                  <span>{item.Jinni}</span>
                </div>
                <div className="md:col-span-4 flex items-start gap-3 text-sm text-slate-400 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    ✕
                  </div>
                  <span>{item.legacy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#5b4dfb] to-[#7c3aed] text-white font-bold text-base shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-105"
          >
            <span>Upgrade Your School Today</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
