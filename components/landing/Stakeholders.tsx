"use client";

import Link from "next/link";
import Image from "next/image";

const roleCards = [
  {
    role: "Administrators",
    title: "Institutional Command Center",
    desc: "Complete operational control, compliance automation, and real-time revenue analytics across your entire institution.",
    image: "/images/admin_portal.jpg",
    features: [
      "Complete school operational visibility & security",
      "Real-time fee collection, invoices & financial analytics",
      "Automated compliance, audit logs & board reporting",
      "Staff scheduling & faculty workload optimization",
    ],
    href: "/for-teachers",
    accent: "from-blue-600 to-indigo-600",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    role: "Teachers & Educators",
    title: "AI-Powered Teaching Assistant",
    desc: "Automate hours of grading and lesson planning so you can focus on personalized student mentoring.",
    image: "/images/teachers_group.jpg",
    features: [
      "Auto-grading handwritten tests & essay evaluations",
      "Instant AI lesson plans, rubrics & worksheet generation",
      "Automated attendance tracking & parent absence alerts",
      "Student comprehension analytics & gap detection",
    ],
    href: "/for-teachers",
    accent: "from-purple-600 to-indigo-600",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    role: "Students & Parents",
    title: "Collaborative Learning & Family Portal",
    desc: "Empower students with a 24/7 AI tutor while keeping parents closely connected to academic milestones.",
    image: "/images/parent_portal.jpg",
    features: [
      "24/7 AI tutor & personalized study roadmaps",
      "Instant report cards & gradebook transparency",
      "Direct parent-teacher messaging with instant translation",
      "Homework submission portal & exam prep tracker",
    ],
    href: "/for-students",
    accent: "from-pink-600 to-purple-600",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
  },
];

export function Stakeholders() {
  return (
    <section className="section bg-gradient-to-b from-[#4f3df5] via-[#4332e6] to-[#3b2bc7] text-white py-24">
      <div className="section-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-5">
            <span>FOR EVERY ROLE</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            One School Management Platform for Every Role
          </h2>
          <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed">
            Tailored workflows, dedicated dashboards, and AI superpowers designed specifically for each stakeholder in your educational community.
          </p>
        </div>

        {/* 3 Large Showcase Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {roleCards.map((card) => (
            <div
              key={card.role}
              className="bg-white rounded-3xl p-6 sm:p-8 text-gray-900 shadow-2xl hover:shadow-indigo-900/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between border border-white/80"
            >
              <div>
                {/* Illustration Preview */}
                <div className="relative w-full h-44 sm:h-48 md:h-52 rounded-2xl overflow-hidden mb-6 bg-slate-100 shadow-inner">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${card.badgeColor}`}>
                    {card.role}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3
                  className="text-xl sm:text-2xl font-bold text-gray-950 mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {card.desc}
                </p>

                {/* Bullet Points */}
                <ul className="space-y-3 mb-8">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-[#5b4dfb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Link */}
              <Link
                href={card.href}
                className="inline-flex items-center justify-between w-full py-3.5 px-5 rounded-xl bg-gray-50 hover:bg-indigo-50/80 text-sm font-bold text-[#5b4dfb] border border-gray-100 hover:border-indigo-100 transition-colors group"
              >
                <span>Explore {card.role} Suite</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
