import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function ToolsPage() {
  const tools = [
    { name: "Grade Calculator", desc: "Calculate weighted grades and GPA instantly.", icon: "🧮" },
    { name: "Attendance Tracker", desc: "Track and visualize attendance patterns.", icon: "📊" },
    { name: "Assignment Planner", desc: "Plan and schedule assignments with deadlines.", icon: "📅" },
    { name: "Quiz Generator", desc: "AI-powered quiz generation from any topic.", icon: "❓" },
    { name: "Report Card Maker", desc: "Generate professional report cards in minutes.", icon: "📄" },
    { name: "Timetable Builder", desc: "Create optimized class timetables.", icon: "🗓️" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-32">
        <div className="section-inner">
          <div className="text-center mb-16">
            <span className="badge mb-6 inline-flex">Free Tools</span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Free Education <span className="gradient-text">Tools</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Practical tools for teachers, students, and parents — completely free to use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.name} className="card bg-white group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{tool.name}</h3>
                <p className="text-sm text-gray-500">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
