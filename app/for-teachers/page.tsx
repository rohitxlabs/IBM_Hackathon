import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function ForTeachersPage() {
  const features = [
    { title: "AI-Powered Grading", desc: "Automate test evaluation with detailed, personalized feedback in seconds.", icon: "🤖" },
    { title: "Smart Assignment Creator", desc: "Create and distribute assignments with AI-suggested questions and rubrics.", icon: "📝" },
    { title: "Performance Analytics", desc: "Track student progress with visual dashboards and AI-generated insights.", icon: "📊" },
    { title: "Attendance Management", desc: "Mark and track attendance with automated reports and parent notifications.", icon: "📋" },
    { title: "Digital Classroom", desc: "Manage notes, resources, and interactive content for your classes.", icon: "🏫" },
    { title: "Parent Communication", desc: "Connect with parents through real-time messaging and automated updates.", icon: "💬" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-32">
        <div className="section-inner">
          <div className="text-center mb-16">
            <span className="badge mb-6 inline-flex">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              For Teachers
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Empower Your <span className="gradient-text">Teaching</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Focus on what matters most — teaching. Let Jinni handle the administrative work with AI-powered tools designed for educators.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link href="/register" className="btn-primary">Start Free Trial</Link>
              <Link href="/ai-assistant" className="btn-secondary">Try AI Assistant</Link>
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
