"use client";

import { createContext, useContext, useState, type ReactNode, type HTMLAttributes } from "react";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onChange,
  children,
  className = "",
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;

  const handleChange = (newValue: string) => {
    setUncontrolledValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-1 p-1 bg-gray-100 rounded-[var(--radius-sm)]
        ${className}
      `}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  children,
  className = "",
  ...props
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onChange(value)}
      className={`
        px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)]
        transition-all duration-200
        ${isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  children,
  className = "",
  ...props
}: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`mt-4 animate-fade-in ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
