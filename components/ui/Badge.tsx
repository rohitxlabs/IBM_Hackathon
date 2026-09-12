import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-600",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-500",
  primary: "bg-primary-500",
  secondary: "bg-secondary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
};

export function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-full)]
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
