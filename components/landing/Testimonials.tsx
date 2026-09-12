"use client";

import { useState } from "react";

const testimonials = [
  {
    quote: "Jinni has transformed how I manage my classroom. The AI grading saves me hours every week, and the analytics help me identify struggling students early.",
    name: "Priya Sharma",
    role: "High School Teacher, Delhi",
    initial: "P",
  },
  {
    quote: "As a parent, I love being able to track my daughter's progress in real-time. The attendance notifications and report cards are always accessible.",
    name: "Rajesh Kumar",
    role: "Parent, Mumbai",
    initial: "R",
  },
  {
    quote: "The AI assistant helped me improve my math scores by 30%. It explains concepts in a way that actually makes sense.",
    name: "Ananya Patel",
    role: "Student, Bangalore",
    initial: "A",
  },
  {
    quote: "We deployed Jinni across our 12 schools. The unified dashboard gives our administration unprecedented visibility into performance.",
    name: "Dr. Meera Iyer",
    role: "School Director, Chennai",
    initial: "M",
  },
  {
    quote: "The homework portal is a game-changer. Students submit digitally, I provide AI-assisted feedback, and parents can see everything in real-time.",
    name: "Vikram Singh",
    role: "Mathematics Teacher, Jaipur",
    initial: "V",
  },
  {
    quote: "My son loves using Jinni for his studies. The AI tutor is patient, always available, and makes learning fun with interactive quizzes.",
    name: "Sunita Reddy",
    role: "Parent, Hyderabad",
    initial: "S",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const next = () => setCurrent((p) => (p + 1) % totalPages);
  const prev = () => setCurrent((p) => (p - 1 + totalPages) % totalPages);

  const visible = testimonials.slice(current * itemsPerPage, current * itemsPerPage + itemsPerPage);

  return (
    <section className="section bg-[var(--surface)]">
      <div className="section-inner">
        <div className="text-center mb-16">
          <span className="badge mb-4 inline-flex">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            What People Say
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {visible.map((t) => (
            <div key={t.name} className="card bg-white">
              <svg className="w-8 h-8 text-[var(--accent)] opacity-20 mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.3 5.2C7.5 6.8 5 10.3 5 14c0 2.8 2.2 5 5 5s5-2.2 5-5-2.2-5-5-5c-.5 0-1 .1-1.5.2L11.3 5.2zm8 0C15.5 6.8 13 10.3 13 14c0 2.8 2.2 5 5 5s5-2.2 5-5-2.2-5-5-5c-.5 0-1 .1-1.5.2l1.8-3.8z" />
              </svg>
              <p className="text-gray-600 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center text-white text-sm font-bold">
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm text-gray-400 font-medium">
            {String(current + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          </span>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
