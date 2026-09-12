import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/** Shared frame for the sign-in and sign-up screens. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-gray-200 shadow-[var(--card-shadow)] p-6 sm:p-8">
      <div className="text-center mb-7">
        <div className="flex justify-center mb-6">
          <Logo href="/" />
        </div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {children}

      <p className="text-center text-sm text-gray-500 mt-6">{footer}</p>
    </div>
  );
}

/** Inline form-level error, announced to assistive technology. */
export function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="text-sm text-danger-600 bg-danger-50 rounded-[var(--radius-sm)] px-4 py-2.5"
    >
      {message}
    </p>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <>
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-[var(--accent)] hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {label}
      </Link>
    </>
  );
}
