import { useEffect, useState } from 'react';
import { products } from '../data/mockData';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

const accountStats = [
  { label: 'Role', value: 'Pricing Analyst' },
  { label: 'Saved views', value: '7' },
  { label: 'Approved queues', value: '42' },
];

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [saved, setSaved] = useState(false);
  const [recentDecisions, setRecentDecisions] = useState([]);

  useEffect(() => {
    setName(currentUser?.name || '');
  }, [currentUser]);

  useEffect(() => {
    let active = true;

    const loadDecisions = async () => {
      try {
        const data = await apiRequest('/profile/decisions');
        if (active) setRecentDecisions(data);
      } catch (error) {
        if (active) setRecentDecisions([]);
      }
    };

    loadDecisions();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    await updateProfile({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <section className="page-stack">
      <article className="card profile-banner">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
          alt="Profile workspace"
          loading="lazy"
        />
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Workspace and access settings</h2>
          <p className="muted">Manage identity, permissions and recent pricing decisions.</p>
        </div>
      </article>

      <section className="kpi-grid profile-kpis">
        {accountStats.map((stat) => (
          <article key={stat.label} className="card stat">
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="profile-grid">
        <article className="card">
          <h3>User info</h3>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              Name
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={currentUser?.email || ''} readOnly />
            </label>
            <button type="submit" className="button">
              Save changes
            </button>
            {saved ? <p className="success-text">Profile updated</p> : null}
          </form>
        </article>

        <article className="card">
          <h3>Recent decision history</h3>
          <div className="order-list">
            {recentDecisions.length === 0 ? (
              <p className="muted">No pricing decisions yet. Approve or override prices to build history.</p>
            ) : null}
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="order-row">
                <div>
                  <strong>{decision.id}</strong>
                  <p className="muted">{new Date(decision.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="tag">{decision.status}</span>
                <strong>{decision.impact}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="lookbook-grid">
        {products.slice(0, 3).map((item) => (
          <article key={item.id} className="card lookbook-card">
            <img src={item.image} alt={item.name} loading="lazy" />
            <div>
              <strong>{item.name}</strong>
              <p className="muted">Pinned in your workspace quick-access library.</p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
