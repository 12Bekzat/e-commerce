import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <article className="card empty-state">Loading session...</article>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== 'ROLE_ADMIN') {
    return (
      <article className="card empty-state">
        <h3>Admin access required</h3>
        <p className="muted">This workspace is available only for administrator accounts.</p>
      </article>
    );
  }

  return children;
}
