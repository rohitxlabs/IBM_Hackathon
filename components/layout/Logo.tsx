import Link from "next/link";

/** The Jinni wordmark. Links home unless rendered as a plain badge. */
export function Logo({
  href = "/",
  size = "md",
}: {
  href?: string | null;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const text = size === "sm" ? "text-lg" : "text-xl";

  const mark = (
    <>
      <span
        className={`flex items-center justify-center ${box} rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)]`}
      >
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
      </span>
      <span
        className={`${text} font-bold text-gray-900`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Jinni
      </span>
    </>
  );

  if (!href) {
    return <span className="flex items-center gap-2.5">{mark}</span>;
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {mark}
    </Link>
  );
}
