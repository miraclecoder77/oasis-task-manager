import Button from './Button.jsx';

function Alert({ title, children, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-control border border-danger-fg/20 bg-danger-bg p-4 text-danger-fg"
    >
      {title && <p className="text-sm font-semibold">{title}</p>}
      {children && (
        <p className={`text-[13px] font-normal ${title ? 'mt-1' : ''}`}>
          {children}
        </p>
      )}
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          className="mt-3"
          type="button"
        >
          Retry
        </Button>
      )}
    </div>
  );
}

export default Alert;
