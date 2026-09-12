"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="gradient-orb gradient-orb-1 -top-40 -left-40 animate-pulse-glow" />
      <div className="gradient-orb gradient-orb-2 top-20 -right-32 animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="gradient-orb gradient-orb-3 -bottom-20 left-1/3 animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="section-inner relative z-10 text-center">
        <div className="animate-fade-in mb-6">
          <span className="badge">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            Now in Beta — Start Free Today
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-slide-up"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          AI-Powered School
          <br />
          <span className="gradient-text">Management Software</span>
          <br />
          for Future-Ready Schools
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
          Jinni connects teachers, students, and parents in one intelligent platform.
          Automate grading, track attendance, and unlock personalized learning with your AI assistant.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
          <Link href="/register" className="btn-primary btn-lg group">
            Start Free Trial
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/ai-assistant" className="btn-secondary btn-lg group">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            Talk to Jinni AI
          </Link>
        </div>

        {/* Mascot */}
        <div className="mt-16 animate-float">
          <img
            src="/mascot.svg"
            alt="Jinni AI Mascot"
            className="w-40 h-40 sm:w-52 sm:h-52 mx-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
