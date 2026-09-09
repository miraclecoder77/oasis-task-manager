import { useEffect, useRef } from 'react';

function Modal({ open, onClose, title, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    // Stop the page behind the modal from scrolling with it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center"
      // A click that starts inside the panel and ends here should not close it.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-full w-full max-w-md overflow-y-auto rounded-card bg-white p-6 shadow-lg outline-none"
      >
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
