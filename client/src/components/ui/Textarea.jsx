import { useId } from 'react';

function Textarea({ label, error, className = '', ...props }) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-ink-700"
      >
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full resize-y rounded-control border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-2 focus:outline-offset-0 focus:outline-brand-500 ${
          error ? 'border-danger-fg' : 'border-ink-300'
        }`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-[13px] font-normal text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export default Textarea;
