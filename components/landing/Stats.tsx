export function Stats() {
  const stats = [
    { value: "500+", label: "Schools", sub: "across 15 states" },
    { value: "50K+", label: "Students", sub: "learning daily" },
    { value: "10K+", label: "Teachers", sub: "empowered with AI" },
    { value: "99.9%", label: "Uptime", sub: "enterprise reliability" },
  ];

  return (
    <section className="section bg-[var(--surface)]">
      <div className="section-inner">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-2">
            Trusted by Thousands
          </h2>
          <p className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Empowering Schools Nationwide
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-[var(--foreground)]">{stat.label}</div>
              <div className="text-sm text-gray-400">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
