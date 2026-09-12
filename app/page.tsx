import {
  Navbar,
  Hero,
  Stats,
  Features,
  Stakeholders,
  AIAssistant,
  Testimonials,
  FAQ,
  CTA,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Stakeholders />
      <AIAssistant />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
