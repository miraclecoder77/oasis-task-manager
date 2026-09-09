import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';

function LoginPage() {
  const { login, isAuthenticated, isChecking } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-500">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/tasks" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/tasks', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setFieldErrors(error.details);
      }
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="rounded-card border border-ink-300 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-ink-900">Sign in</h1>
          <p className="mt-1 text-[13px] font-normal text-ink-500">
            Sign in to manage your tasks.
          </p>

          {formError && (
            <div className="mt-4">
              <Alert title="Could not sign in">{formError}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="test@oasis.dev"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fieldErrors.email?.[0]}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password123!"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={fieldErrors.password?.[0]}
            />
            <Button type="submit" loading={submitting} className="w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
