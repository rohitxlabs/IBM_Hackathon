import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  action?: ReactNode;
}

/** Consistent page title block used at the top of every screen. */
export function PageHeader({
  title,
  description,
  crumbs,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      {crumbs && crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            className="text-2xl font-bold text-gray-900 truncate"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
