import { Link } from 'react-router-dom';
import {
  brandStrip,
  dashboardStats,
  editorialCollections,
  heroGallery,
  testimonials,
} from '../data/mockData';

const capabilities = [
  {
    title: 'Econometric transparency',
    description:
      'Estimate price elasticity and demand response with interpretable coefficients.',
  },
  {
    title: 'Reinforcement-learning adaptation',
    description:
      'Continuously improve price policies based on observed market feedback loops.',
  },
  {
    title: 'Operational governance',
    description:
      'Approve, override and track recommendations with clear business constraints.',
  },
];

export default function HomePage() {
  return (
    <section className="page-stack">
      <article className="card hero-block hero-with-media">
        <div className="hero-copy">
          <p className="eyebrow">DPMEM framework</p>
          <h2>Intelligent demand and price management workspace</h2>
          <p className="muted">
            Frontend prototype based on the diploma architecture: Web UI, backend orchestration,
            econometric forecasting and RL optimization in one decision-support flow.
          </p>
          <div className="actions">
            <Link className="button-link primary" to="/catalog">
              Product intelligence
            </Link>
            <Link className="button-link" to="/pricing-center">
              Open pricing center
            </Link>
            <Link className="button-link" to="/analytics">
              Explore analytics
            </Link>
          </div>
          <div className="hero-tags">
            <span>Demand Forecasting</span>
            <span>Elasticity Estimation</span>
            <span>Dynamic Pricing</span>
            <span>Closed Feedback Loop</span>
          </div>
        </div>

        <div className="hero-gallery">
          {heroGallery.slice(0, 2).map((item) => (
            <article key={item.title} className="hero-photo-card">
              <img src={item.image} alt={item.title} loading="lazy" />
              <div>
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <section className="brand-strip">
        {brandStrip.map((brand) => (
          <span key={brand}>{brand}</span>
        ))}
      </section>

      <section className="kpi-grid">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="card stat">
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="feature-grid">
        {capabilities.map((capability) => (
          <article key={capability.title} className="card feature-card">
            <h3>{capability.title}</h3>
            <p className="muted">{capability.description}</p>
          </article>
        ))}
      </section>

      <section className="editorial-grid">
        {editorialCollections.map((item) => (
          <article key={item.id} className="card editorial-card">
            <img src={item.image} alt={item.title} loading="lazy" />
            <div>
              <h3>{item.title}</h3>
              <p className="muted">{item.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="testimonial-grid">
        {testimonials.map((item) => (
          <article key={item.author} className="card testimonial-card">
            <p>"{item.quote}"</p>
            <strong>{item.author}</strong>
            <small>{item.role}</small>
          </article>
        ))}
      </section>
    </section>
  );
}
