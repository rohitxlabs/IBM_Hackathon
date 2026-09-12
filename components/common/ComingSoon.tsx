import { EmptyState } from "@/components/ui";
import { PageHeader } from "./PageHeader";
import type { Crumb } from "./Breadcrumbs";

/**
 * Placeholder for screens that are scheduled for a later build phase. It
 * exists so navigation is never broken while the app is assembled section by
 * section; each one is replaced by the real screen in its phase.
 */
export function ComingSoon({
  title,
  description,
  crumbs,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  return (
    <div>
      <PageHeader title={title} crumbs={crumbs} />
      <EmptyState
        icon={
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
            <path d="M12 8v4l3 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        }
        title="This screen is on its way"
        description={
          description ??
          `${title} is being built. It will appear here as soon as it is ready.`
        }
      />
    </div>
  );
}
