import {
  Navbar,
  Hero,
  Stats,
  Stakeholders,
  Features,
  Comparison,
  AIAssistant,
  Testimonials,
  FAQ,
  CTA,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <Stakeholders />
      <Features />
      <Comparison />
      <AIAssistant />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
