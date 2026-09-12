"use client";

import Link from "next/link";

export function AIAssistant() {
  return (
    <section className="section relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="gradient-orb gradient-orb-1 -top-20 right-0 animate-pulse-glow" />

      <div className="section-inner relative z-10">
        <div className="bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] rounded-3xl p-8 sm:p-12 lg:p-16 text-white overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20 mb-6">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
                Jinni AI — Your Intelligent Assistant
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                Meet <span className="text-yellow-200">Jinni</span>, Your AI Companion
              </h2>

              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Jinni is your always-on AI assistant that helps with homework, answers questions, generates study plans, and provides personalized learning guidance — available 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/ai-assistant" className="btn-glass">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                  Talk to Jinni
                </Link>
                <Link href="/register" className="btn-glass">
                  Start Free Trial
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Chat Preview */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">Jinni AI</div>
                  <div className="text-xs text-white/60">Always here to help</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl rounded-tl-sm p-3 max-w-[85%]">
                  <p className="text-sm">Can you help me understand quadratic equations?</p>
                </div>
                <div className="bg-white/20 rounded-xl rounded-tr-sm p-3 max-w-[85%] ml-auto">
                  <p className="text-sm">Of course! Quadratic equations follow the form <strong>ax² + bx + c = 0</strong>. Let me break it down step by step...</p>
                </div>
                <div className="flex gap-2">
                  {["Explain", "Quiz me", "Practice"].map((q) => (
                    <span key={q} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70 border border-white/10">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
