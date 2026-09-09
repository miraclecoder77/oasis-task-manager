import Button from './Button.jsx';

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-ink-300 bg-white px-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </span>

      <p className="mt-4 text-base font-semibold text-ink-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm font-normal text-ink-500">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
