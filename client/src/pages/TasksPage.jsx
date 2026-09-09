import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks, useCreateTask, useUpdateTask } from '../hooks/useTasks.js';
import { FILTERS } from '../lib/status.js';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Alert from '../components/ui/Alert.jsx';
import TaskList from '../components/TaskList.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';

function TasksPage() {
  const { user, logout } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const filters = statusFilter ? { status: statusFilter } : {};
  const { data: tasks, isPending, isError, error, refetch } = useTasks(filters);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, data: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-300 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="text-base font-semibold text-ink-900">Oasis</span>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="truncate text-[13px] font-normal text-ink-500">
              {user?.email}
            </span>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-ink-900">Tasks</h1>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tasks by status">
            {FILTERS.map((filter) => {
              const active = statusFilter === filter.value;
              return (
                <button
                  key={filter.value || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-500 text-white'
                      : 'border border-ink-300 bg-white text-ink-700 hover:bg-ink-100'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <Button onClick={openCreate} className="w-full sm:w-auto">
            New task
          </Button>
        </div>

        <div className="mt-6">
          {isPending && (
            <div className="flex justify-center py-8 text-brand-500">
              <Spinner size="lg" />
            </div>
          )}

          {isError && (
            <Alert title="Could not load tasks" onRetry={refetch}>
              {error.message}
            </Alert>
          )}

          {!isPending && !isError && tasks.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-500">
              No tasks to show.
            </p>
          )}

          {!isPending && !isError && tasks.length > 0 && (
            <TaskList tasks={tasks} onEdit={openEdit} />
          )}
        </div>
      </main>

      <TaskFormModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}

export default TasksPage;
