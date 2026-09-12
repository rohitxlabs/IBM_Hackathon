import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function ForParentsPage() {
  const features = [
    { title: "Real-Time Tracking", desc: "Monitor your child's attendance, grades, and school activities live.", icon: "📍" },
    { title: "AI Progress Reports", desc: "Receive intelligent reports with actionable insights for improvement.", icon: "📊" },
    { title: "Direct Messaging", desc: "Communicate directly with teachers through the built-in messaging system.", icon: "💬" },
    { title: "Assignment Alerts", desc: "Never miss a deadline — get notified about all upcoming assignments.", icon: "🔔" },
    { title: "PTM Scheduling", desc: "Book parent-teacher meetings with a single click.", icon: "📅" },
    { title: "School Announcements", desc: "Stay updated with all school-wide notifications and events.", icon: "📢" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-32">
        <div className="section-inner">
          <div className="text-center mb-16">
            <span className="badge mb-6 inline-flex">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              For Parents
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Stay Connected with Your <span className="gradient-text">Child&apos;s Education</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Be involved in your child's learning journey. Track progress, communicate with teachers, and never miss a school update.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link href="/register" className="btn-primary">Start Free Trial</Link>
              <Link href="/contact" className="btn-secondary">Schedule a Demo</Link>
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
