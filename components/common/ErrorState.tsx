"use client";

import { Button } from "@/components/ui";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Shown when a request fails. Always offers a way forward. */
export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this right now. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center py-12 px-4"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-50 text-danger-600 mb-4">
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
