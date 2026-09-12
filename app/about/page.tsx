import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-32">
        <div className="section-inner max-w-4xl mx-auto text-center">
          <span className="badge mb-6 inline-flex">About Jinni</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Where Curiosity Meets <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-12">
            Jinni is on a mission to transform education through AI. We believe every school deserves intelligent tools
            that empower teachers, engage students, and inform parents — making learning personalized and effective.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { title: "Our Mission", desc: "To make AI-powered education accessible to every school, teacher, student, and parent across the globe." },
              { title: "Our Vision", desc: "A world where technology enhances human potential in education, not replaces it." },
              { title: "Our Values", desc: "Innovation, accessibility, privacy, and a relentless focus on learning outcomes." },
            ].map((item) => (
              <div key={item.title} className="card bg-white">
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
