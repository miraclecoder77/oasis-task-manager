/**
 * Due dates are stored as UTC midnight, so both formatting and parsing stay in
 * UTC — using local getters would shift the date by a day west of Greenwich.
 */
export const toDateInputValue = (isoString) =>
  isoString ? isoString.slice(0, 10) : '';

export const formatDueDate = (isoString) => {
  if (!isoString) return null;

  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};
