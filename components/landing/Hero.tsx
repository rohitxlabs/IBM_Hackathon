"use client";

import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
      {/* Background Subtle Patterns */}
      <div className="absolute inset-0 dot-grid opacity-35" />
      <div className="gradient-orb gradient-orb-1 -top-20 -left-20 animate-pulse-glow" />
      <div className="gradient-orb gradient-orb-2 top-40 -right-20 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="section-inner relative z-10 w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-[#5b4dfb] text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-[#5b4dfb] animate-ping" />
            <span className="font-bold tracking-wide uppercase text-[11px]">All-in-One AI School Management</span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0f111a] leading-[1.12] mb-6 animate-slide-up"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Modernize, Automate, & Elevate your Entire{" "}
            <span className="bg-gradient-to-r from-[#5b4dfb] via-[#7c3aed] to-[#db2777] bg-clip-text text-transparent">
              School Ecosystem.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal animate-slide-up delay-100">
            Experience next-level institutional management. Jinni brings administrators, educators, students, and parents into one unified, intelligent workspace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-slide-up delay-200">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#5b4dfb] hover:bg-[#4c3ce6] text-white font-semibold rounded-full shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 group text-base"
            >
              <span>Start Free Trial</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/for-teachers"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-full border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              <svg className="w-5 h-5 text-[#5b4dfb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <span>Explore Solutions</span>
            </Link>
          </div>
        </div>

        {/* Hero Visual: Mascot & Smartphone Dashboard with floating badges */}
        <div className="relative mt-12 max-w-3xl mx-auto flex items-center justify-center animate-fade-in delay-300">
          {/* Main Visual Container */}
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/15 border border-indigo-100/60 bg-gradient-to-b from-indigo-50/40 to-white p-4 sm:p-6 flex items-center justify-center">
            <Image
              src="/images/genie.png"
              alt="Jinni AI Genie Mascot"
              width={380}
              height={380}
              className="w-full max-w-[240px] sm:max-w-[300px] md:max-w-[360px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 360px"
              priority
            />
          </div>

          {/* Floating Badge 1: Top Left AI Tag */}
          <div className="hidden sm:flex absolute -top-4 -left-4 items-center gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-indigo-100 animate-float">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              ⚡
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">AI Assistant</div>
              <div className="text-[11px] text-gray-500">Auto-Grading 99.4%</div>
            </div>
          </div>

          {/* Floating Badge 2: Top Right Live Portal */}
          <div className="hidden sm:flex absolute top-12 -right-6 items-center gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-100 animate-float" style={{ animationDelay: "1.2s" }}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Real-time Sync</div>
              <div className="text-[11px] text-emerald-600 font-semibold">99.2% Attendance</div>
            </div>
          </div>

          {/* Floating Badge 3: Bottom Left Ratings */}
          <div className="hidden sm:flex absolute bottom-8 -left-8 items-center gap-2.5 px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-amber-100 animate-float" style={{ animationDelay: "2s" }}>
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-xs font-bold text-gray-800">4.9/5 by 500+ Schools</span>
          </div>
        </div>
      </div>
    </section>
  );
}
