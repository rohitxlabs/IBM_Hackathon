import { type ImgHTMLAttributes } from "react";

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "children" | "src" | "alt"> {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const sizeStyles = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const fallbackColors = [
  "bg-primary-100 text-primary-700",
  "bg-secondary-100 text-secondary-700",
  "bg-accent-100 text-accent-700",
  "bg-success-100 text-success-700",
  "bg-warning-100 text-warning-600",
];

function getColorFromName(name: string): string {
  const index = name.charCodeAt(0) % fallbackColors.length;
  return fallbackColors[index];
}

export function Avatar({
  src,
  alt,
  size = "md",
  fallback,
  className = "",
  ...props
}: AvatarProps) {
  const initials = fallback || getInitials(alt);
  const colorClass = getColorFromName(alt);

  return (
    <div
      className={`
        relative inline-flex items-center justify-center rounded-full
        overflow-hidden shrink-0
        ${sizeStyles[size]}
        ${!src ? colorClass : ""}
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : (
        <span className="font-semibold">{initials}</span>
      )}
    </div>
  );
}
