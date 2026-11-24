export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      data-testid="empty-state"
      className="rounded-lg border border-dashed border-[#E5E5E0] p-10 text-center"
    >
      <p className="text-base font-medium text-[#1A1A1A]">
        {filtered ? "Nothing matches these filters" : "Nothing here yet"}
      </p>
      <p className="mt-1 text-sm text-[#5C5C5C]">
        {filtered ? "Try clearing a filter." : "Projects and ideas will show up here once they are published."}
      </p>
    </div>
  );
}
