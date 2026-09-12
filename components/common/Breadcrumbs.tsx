import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

/** Trail of links; the final crumb is the current page and is not a link. */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-medium text-gray-700" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-gray-300">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
