import { Skeleton } from "@/components/ui";

/** Accessible spinner for short waits. */
export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500"
    >
      <svg
        className="animate-spin h-5 w-5 text-primary-600"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>{label}…</span>
    </div>
  );
}

/** Page-shaped skeleton used while a screen's data is in flight. */
export function LoadingPage({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <Skeleton height={28} width="40%" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={88} />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={72} />
        ))}
      </div>
    </div>
  );
}
