export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-background px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
