import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './ui/Spinner.jsx';
import Alert from './ui/Alert.jsx';

function ProtectedRoute() {
  const { isAuthenticated, isChecking, hasSessionError, retrySession } =
    useAuth();

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-500">
        <Spinner size="lg" />
      </div>
    );
  }

  // The token may still be good — the API just could not be reached. Offer a
  // retry rather than signing the user out.
  if (hasSessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Alert title="Could not reach the server" onRetry={retrySession}>
            Your session could not be verified. Check that the API is running,
            then try again.
          </Alert>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
