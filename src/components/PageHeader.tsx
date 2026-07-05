// Sticky page header for authenticated pages (Stitch redesign).
// Title in primary blue, optional divider + description, right-aligned actions.
export function PageHeader({
  title,
  description,
  actions,
  tag,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tag?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 md:px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-lg font-semibold text-primary md:text-xl">{title}</h1>
        {description && (
          <>
            <span className="hidden h-4 w-px bg-line md:inline-block" aria-hidden="true" />
            <p className="text-sm text-slate-500">{description}</p>
          </>
        )}
        {tag && <span className="ml-1">{tag}</span>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
