import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="card top-nav">
        <div>
          <p className="eyebrow">DPMEM Platform</p>
          <h1>Demand & Price Management System</h1>
          <p className="muted nav-subtitle">
            Decision-support web UI based on the diploma architecture.
          </p>
        </div>

        <nav className="top-links" aria-label="Main navigation">
          <NavLink to="/">Overview</NavLink>
          <NavLink to="/catalog">Product Intelligence</NavLink>
          <NavLink to="/pricing-center">Pricing Center</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
          {isAuthenticated ? <NavLink to="/profile">Profile</NavLink> : null}
          {currentUser?.role === 'ROLE_ADMIN' ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>

        <div className="auth-actions">
          {isAuthenticated ? (
            <>
              <span className="muted">{currentUser?.name}</span>
              <button type="button" className="button ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="button-link" to="/login">
                Login
              </NavLink>
              <NavLink className="button-link primary" to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer muted">
        Hybrid econometric + reinforcement-learning pricing interface prototype.
      </footer>
    </div>
  );
}
