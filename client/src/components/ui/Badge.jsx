import { STATUS_META } from '../../lib/status.js';

function Badge({ status }) {
  const meta = STATUS_META[status];
  if (!meta) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.02em] ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}

export default Badge;
