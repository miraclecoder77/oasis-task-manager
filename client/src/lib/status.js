/** Single source of truth for status labels and treatment across the UI. */
export const STATUS_META = {
  pending: {
    label: 'Pending',
    badge: 'bg-status-pending-bg text-status-pending-fg',
    accent: 'bg-status-pending-accent',
  },
  'in-progress': {
    label: 'In progress',
    badge: 'bg-status-progress-bg text-status-progress-fg',
    accent: 'bg-status-progress-accent',
  },
  done: {
    label: 'Done',
    badge: 'bg-status-done-bg text-status-done-fg',
    accent: 'bg-status-done-accent',
  },
};

export const STATUS_ORDER = ['pending', 'in-progress', 'done'];

export const FILTERS = [
  { value: '', label: 'All' },
  ...STATUS_ORDER.map((value) => ({ value, label: STATUS_META[value].label })),
];
