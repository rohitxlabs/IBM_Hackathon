import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-[var(--radius-sm)] border bg-white
              text-gray-900 placeholder-gray-400
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-gray-50 disabled:text-gray-500
              ${icon ? "pl-10" : "pl-3"}
              pr-3 py-2.5 text-sm
              ${error ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500" : "border-gray-200"}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
