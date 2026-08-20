import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  icon: Icon = Inbox,
}: {
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}
