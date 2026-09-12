"use client";

import { Suspense, useState } from "react";
import { Skeleton } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { AuthCard, AuthFooterLink, FormError } from "@/components/auth/AuthCard";
import { homePathForRole, login } from "@/lib/api/auth";
import { fieldErrorsFromError, messageFromError } from "@/lib/api/errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const user = await login({ email, password });

      // Return the user where they were headed, but only within this app.
      const next = searchParams.get("next");
      const destination =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : homePathForRole(user.role);

      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(messageFromError(err, "We couldn't sign you in."));
      setFieldErrors(fieldErrorsFromError(err));
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue learning"
      footer={
        <AuthFooterLink
          prompt="New to Jinni?"
          href="/register"
          label="Create an account"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />

        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          autoComplete="current-password"
          required
        />

        {error && <FormError message={error} />}

        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>

      {/*
        No role picker here on purpose: the account already knows its role, so
        asking would only give the user a way to pick the wrong answer.
      */}
    </AuthCard>
  );
}

/**
 * `useSearchParams` opts the form into client rendering, so a skeleton stands
 * in for it on the server rather than a blank card.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-gray-200 p-6 sm:p-8 space-y-5">
      <Skeleton height={40} width="50%" className="mx-auto" />
      <Skeleton height={64} />
      <Skeleton height={64} />
      <Skeleton height={44} />
    </div>
  );
}
