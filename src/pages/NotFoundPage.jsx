import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <article className="card auth-card">
        <p className="eyebrow">404</p>
        <h2>Page not found</h2>
        <p className="muted">This route does not exist in the current prototype.</p>
        <Link className="button-link primary" to="/">
          Back to home
        </Link>
      </article>
    </div>
  );
}
