/**
 * Mirrors TaskCard's shape — accent strip, title, body line, meta row — so the
 * list does not jump when real data replaces it.
 */
function SkeletonCard() {
  return (
    <div
      className="flex overflow-hidden rounded-card border border-ink-300 bg-white"
      aria-hidden="true"
    >
      <div className="w-[3px] shrink-0 bg-ink-300" />

      <div className="flex flex-1 animate-pulse flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="h-4 w-1/2 rounded bg-ink-100" />
          <div className="h-6 w-20 shrink-0 rounded-full bg-ink-100" />
        </div>
        <div className="h-3 w-full rounded bg-ink-100" />
        <div className="h-3 w-2/3 rounded bg-ink-100" />
        <div className="mt-1 h-3 w-28 rounded bg-ink-100" />
      </div>
    </div>
  );
}

export default SkeletonCard;
