"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-32">
        <div className="section-inner max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge mb-6 inline-flex">Contact Us</span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-gray-500">
              Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.
            </p>
          </div>

          <div className="card bg-white p-8">
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">School Name</label>
                <input type="text" placeholder="Your school name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea rows={4} placeholder="Tell us about your needs..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all text-sm resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
