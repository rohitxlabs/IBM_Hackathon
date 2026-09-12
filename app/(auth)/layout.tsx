import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Jinni",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="gradient-orb gradient-orb-1 -top-40 -left-40 animate-pulse-glow" />
      <div className="gradient-orb gradient-orb-2 bottom-0 -right-32 animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
