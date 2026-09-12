import { type HTMLAttributes } from "react";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "accent";
}

const colorStyles = {
  primary: "bg-primary-100 text-primary-600",
  secondary: "bg-secondary-100 text-secondary-600",
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-600",
  accent: "bg-accent-100 text-accent-600",
};

export function StatCard({
  title,
  value,
  change,
  icon,
  color = "primary",
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-[var(--radius-md)] border border-gray-200 p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <svg
                className={`w-4 h-4 ${
                  change.type === "increase"
                    ? "text-success-500"
                    : "text-danger-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    change.type === "increase"
                      ? "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                      : "M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
                  }
                />
              </svg>
              <span
                className={`text-sm font-medium ${
                  change.type === "increase"
                    ? "text-success-600"
                    : "text-danger-600"
                }`}
              >
                {change.value}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-[var(--radius-md)] ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
