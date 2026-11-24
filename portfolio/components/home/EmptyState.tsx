export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      data-testid="empty-state"
      className="rounded-lg border border-dashed border-[color:var(--border)] p-10 text-center"
    >
      <p className="text-base font-medium text-[color:var(--text)]">
        {filtered ? "Nothing matches these filters" : "Nothing here yet"}
      </p>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        {filtered ? "Try clearing a filter." : "Projects and ideas will show up here once they are published."}
      </p>
    </div>
  );
}
