"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  className = "",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        ref={contentRef}
        className={`
          relative w-full ${sizeStyles[size]} bg-white rounded-[var(--radius-lg)]
          shadow-xl animate-slide-up
          ${className}
        `}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-4">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}
