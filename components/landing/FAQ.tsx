"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is Jinni free for individual teachers?",
    a: "Yes! Individual teachers can use Jinni completely free. School-wide plans start at 999 INR/month with a 30-day free trial — no credit card required.",
  },
  {
    q: "How does the AI grading work?",
    a: "Our AI analyzes student responses against answer rubrics, provides detailed feedback, categorizes strengths and weaknesses, and generates personalized improvement suggestions — all in seconds.",
  },
  {
    q: "Is student data secure?",
    a: "Absolutely. We use enterprise-grade encryption, comply with data protection regulations, and never share student data with third parties. Your data stays yours.",
  },
  {
    q: "Can parents track their child's progress in real-time?",
    a: "Yes! Parents get a dedicated dashboard showing attendance, grades, assignments, and AI-generated progress reports — all updated in real-time.",
  },
  {
    q: "What subjects does Jinni support?",
    a: "Jinni supports all major subjects including Mathematics, Science, English, Social Studies, and more. Our AI is continuously learning and expanding subject coverage.",
  },
  {
    q: "How do I get started?",
    a: "Simply click 'Start Free Trial', create your account, and choose your role (Teacher, Student, or Parent). You'll be up and running in under 2 minutes.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section">
      <div className="section-inner max-w-3xl">
        <div className="text-center mb-16">
          <span className="badge mb-4 inline-flex">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
            </svg>
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open === i ? "rotate-45" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              {open === i && (
                <div className="faq-answer animate-slide-down">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
