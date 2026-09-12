import { Badge } from "@/components/ui";
import type {
  AssignmentStatus,
  PracticeTestStatus,
  WeaknessLevel,
} from "@/lib/api/types";

type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

const assignmentStatus: Record<
  AssignmentStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  SUBMITTED: { label: "Submitted", variant: "secondary" },
  LATE: { label: "Late", variant: "warning" },
  GRADED: { label: "Graded", variant: "success" },
  OVERDUE: { label: "Overdue", variant: "danger" },
};

/** One consistent badge for assignment and submission status everywhere. */
export function AssignmentStatusBadge({
  status,
}: {
  status: AssignmentStatus;
}) {
  const config = assignmentStatus[status] ?? assignmentStatus.PENDING;
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

const practiceStatus: Record<
  PracticeTestStatus,
  { label: string; variant: BadgeVariant }
> = {
  DRAFT: { label: "Not started", variant: "default" },
  IN_PROGRESS: { label: "In progress", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
};

export function PracticeStatusBadge({
  status,
}: {
  status: PracticeTestStatus;
}) {
  const config = practiceStatus[status] ?? practiceStatus.DRAFT;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const weaknessLevel: Record<
  WeaknessLevel,
  { label: string; variant: BadgeVariant }
> = {
  HIGH: { label: "Needs focus", variant: "danger" },
  MEDIUM: { label: "Keep practising", variant: "warning" },
  LOW: { label: "Almost there", variant: "secondary" },
  NONE: { label: "On track", variant: "success" },
};

/**
 * Weakness is phrased as an action rather than a verdict — the product is
 * about improving, so a weak topic should read as a next step, not a failure.
 */
export function WeaknessBadge({ level }: { level: WeaknessLevel }) {
  const config = weaknessLevel[level] ?? weaknessLevel.NONE;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
