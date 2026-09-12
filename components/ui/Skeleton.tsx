import { type HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "rounded-[var(--radius-sm)]",
    circular: "rounded-full",
    rectangular: "rounded-[var(--radius-md)]",
  };

  return (
    <div
      className={`bg-gray-200 animate-pulse ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
}

interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-[var(--radius-md)] border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton width="100%" height={12} />
        <Skeleton width="80%" height={12} />
      </div>
    </div>
  );
}

interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }: SkeletonTableProps) {
  return (
    <div className={`bg-white rounded-[var(--radius-md)] border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <Skeleton width="30%" height={20} />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                width={j === 0 ? "30%" : "15%"}
                height={14}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
