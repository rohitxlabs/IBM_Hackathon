import Link from "next/link";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-[var(--radius-md)] hover:border-gray-300 hover:shadow-md transition-all duration-200"
        >
          <div className={`p-2 rounded-[var(--radius-sm)] ${action.color}`}>
            {action.icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
