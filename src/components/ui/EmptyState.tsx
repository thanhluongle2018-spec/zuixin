export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <div className="font-display text-lg text-ink">{title}</div>
      {description ? <p className="mt-2 text-sm">{description}</p> : null}
    </div>
  );
}
