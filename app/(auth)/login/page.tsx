"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher" | "parent">("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${role}`);
  };

  return (
    <div className="card bg-white p-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Jinni</span>
        </Link>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
          <div className="grid grid-cols-3 gap-2">
            {(["student", "teacher", "parent"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                  role === r
                    ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all text-sm"
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Sign In
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
