import Spinner from './Spinner.jsx';

const variants = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-600 disabled:hover:bg-brand-500',
  secondary:
    'bg-white text-ink-700 border border-ink-300 hover:bg-ink-50 focus-visible:outline-brand-600',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 focus-visible:outline-brand-600',
};

function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export default Button;
