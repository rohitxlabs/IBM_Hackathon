"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { AuthCard, AuthFooterLink, FormError } from "@/components/auth/AuthCard";
import { homePathForRole, register, type RegisterPayload } from "@/lib/api/auth";
import { fieldErrorsFromError, messageFromError } from "@/lib/api/errors";
import type { Role } from "@/lib/api/types";

const roles: { value: Role; label: string; hint: string }[] = [
  { value: "STUDENT", label: "Student", hint: "Track work and practise" },
  { value: "TEACHER", label: "Teacher", hint: "Run classes and grading" },
  { value: "PARENT", label: "Parent", hint: "Follow your child's progress" },
];

/** Mirrors the backend's password rule so the user hears about it sooner. */
function passwordProblem(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters";
  if (!/[a-z]/.test(password)) return "Include a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Include an uppercase letter";
  if (!/[0-9]/.test(password)) return "Include a number";
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Role-specific profile fields the backend requires.
  const [rollNumber, setRollNumber] = useState("");
  const [gradeLevel, setGradeLevel] = useState("9");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function buildPayload(): RegisterPayload {
    const base = { name, email, password };

    if (role === "STUDENT") {
      return {
        ...base,
        role: "STUDENT",
        rollNumber,
        gradeLevel: Number(gradeLevel),
      };
    }

    if (role === "TEACHER") {
      return {
        ...base,
        role: "TEACHER",
        employeeId,
        ...(department ? { department } : {}),
      };
    }

    return { ...base, role: "PARENT", ...(phone ? { phone } : {}) };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const problem = passwordProblem(password);
    if (problem) {
      setFieldErrors({ password: problem });
      return;
    }

    setLoading(true);

    try {
      const user = await register(buildPayload());
      router.push(homePathForRole(user.role));
      router.refresh();
    } catch (err) {
      setError(messageFromError(err, "We couldn't create your account."));
      setFieldErrors(fieldErrorsFromError(err));
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Learning that focuses on getting better, not just scoring"
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          href="/login"
          label="Sign in"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            I am a
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((option) => {
              const selected = role === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={option.hint}
                  onClick={() => setRole(option.value)}
                  className={`py-2.5 px-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    selected
                      ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {roles.find((option) => option.value === role)?.hint}
          </p>
        </fieldset>

        <Input
          name="name"
          label="Full name"
          placeholder="Riya Sharma"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          autoComplete="name"
          required
        />

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
          hint="At least 8 characters, with upper and lower case and a number"
          autoComplete="new-password"
          required
        />

        {role === "STUDENT" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              name="rollNumber"
              label="Roll number"
              placeholder="STU-2401"
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
              error={fieldErrors.rollNumber}
              required
            />
            <Input
              type="number"
              name="gradeLevel"
              label="Grade"
              min={1}
              max={12}
              value={gradeLevel}
              onChange={(event) => setGradeLevel(event.target.value)}
              error={fieldErrors.gradeLevel}
              required
            />
          </div>
        )}

        {role === "TEACHER" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              name="employeeId"
              label="Employee ID"
              placeholder="TCH-1001"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              error={fieldErrors.employeeId}
              required
            />
            <Input
              name="department"
              label="Department"
              placeholder="Mathematics"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              error={fieldErrors.department}
              hint="Optional"
            />
          </div>
        )}

        {role === "PARENT" && (
          <Input
            name="phone"
            label="Phone"
            placeholder="+91 90000 00000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            error={fieldErrors.phone}
            hint="Optional. Helps teachers reach you."
            autoComplete="tel"
          />
        )}

        {error && <FormError message={error} />}

        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
