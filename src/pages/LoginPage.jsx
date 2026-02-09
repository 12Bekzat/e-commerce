import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const highlights = [
  'Real-time pricing visibility',
  'Merchandising and analytics in one flow',
  'Role-based workspace for teams',
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/';

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = login(form);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="auth-page auth-shell">
      <article className="card auth-media">
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
          alt="Login visual"
          loading="lazy"
        />
        <div>
          <h3>Welcome back to DPMEM</h3>
          <ul>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </article>

      <article className="card auth-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Login</h2>
        <p className="muted">Demo user: demo@dpmem.com / demo123</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="button">
            Sign in
          </button>
        </form>

        <p className="muted">
          No account? <Link to="/register">Create one</Link>
        </p>
      </article>
    </div>
  );
}
