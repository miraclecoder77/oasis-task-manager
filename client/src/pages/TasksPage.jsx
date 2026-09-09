import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

function TasksPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-300 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="text-base font-semibold text-ink-900">Oasis</span>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-normal text-ink-500">
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
        <p className="mt-2 text-sm text-ink-500">
          Task list arrives in the next milestone.
        </p>
      </main>
    </div>
  );
}

export default TasksPage;
