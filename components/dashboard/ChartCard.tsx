import { type HTMLAttributes } from "react";
import { Card, CardHeader } from "../ui/Card";

interface ChartCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  action,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} description={description} action={action} />
      <div className="mt-4">{children}</div>
    </Card>
  );
}
