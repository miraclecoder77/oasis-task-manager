import Badge from './ui/Badge.jsx';
import Button from './ui/Button.jsx';
import { STATUS_META } from '../lib/status.js';
import { formatDueDate } from '../lib/date.js';

function TaskCard({ task, onEdit }) {
  const meta = STATUS_META[task.status];
  const isDone = task.status === 'done';
  const dueDate = formatDueDate(task.dueDate);

  return (
    <article
      className={`flex overflow-hidden rounded-card border border-ink-300 bg-white ${
        isDone ? 'opacity-70' : ''
      }`}
    >
      {/* Full-height accent rather than a left border, so it follows the radius. */}
      <div className={`w-[3px] shrink-0 ${meta.accent}`} aria-hidden="true" />

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3
            className={`min-w-0 break-words text-base font-semibold text-ink-900 ${
              isDone ? 'line-through' : ''
            }`}
          >
            {task.title}
          </h3>
          <div className="sm:order-last">
            <Badge status={task.status} />
          </div>
        </div>

        {task.description && (
          <p className="break-words text-sm font-normal text-ink-700">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[13px] font-normal text-ink-500">
            {dueDate ? `Due ${dueDate}` : 'No due date'}
          </span>
          <Button variant="ghost" onClick={() => onEdit(task)}>
            Edit
          </Button>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
