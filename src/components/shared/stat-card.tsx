import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  isLoading?: boolean;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
          <Icon className="size-6 text-primary" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
