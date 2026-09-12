import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function ForStudentsPage() {
  const features = [
    { title: "AI Tutor (Jinni)", desc: "Get 24/7 help with homework, concepts, and study plans from your AI companion.", icon: "✨" },
    { title: "Course Library", desc: "Access all your courses, notes, and study materials in one organized place.", icon: "📚" },
    { title: "Homework Portal", desc: "Submit assignments digitally and receive detailed AI-powered feedback.", icon: "📝" },
    { title: "Progress Tracking", desc: "Visualize your grades, attendance, and improvement over time.", icon: "📊" },
    { title: "Quiz Practice", desc: "Practice with AI-generated quizzes tailored to your learning gaps.", icon: "❓" },
    { title: "Study Planner", desc: "AI-created study schedules based on your exams and weak areas.", icon: "📅" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-32">
        <div className="section-inner">
          <div className="text-center mb-16">
            <span className="badge mb-6 inline-flex">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              For Students
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Learn <span className="gradient-text">Smarter</span>, Not Harder
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Your personal AI tutor is always available. Get help, practice, and improve with Jinni by your side.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link href="/register" className="btn-primary">Start Free Trial</Link>
              <Link href="/ai-assistant" className="btn-secondary">Talk to Jinni AI</Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card bg-white group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
