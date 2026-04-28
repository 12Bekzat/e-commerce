import {
  activityFeed,
  queueStatuses,
  scenarioCards,
} from '../data/mockData';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export default function PricingCenterPage() {
  const [rows, setRows] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [overrideValue, setOverrideValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      try {
        const data = await apiRequest('/pricing/recommendations');
        if (!active) return;
        setRows(data);
        setSelectedSku(data[0]?.sku || '');
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadRecommendations();
    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(() => rows.find((row) => row.sku === selectedSku), [rows, selectedSku]);

  const summary = useMemo(() => {
    const pending = rows.filter((item) => item.status === 'Pending').length;
    const approved = rows.filter((item) => item.status === 'Approved').length;
    const overridden = rows.filter((item) => item.status === 'Overridden').length;
    return { pending, approved, overridden };
  }, [rows]);

  const handleApproveAll = async () => {
    const data = await apiRequest('/pricing/approve-all', { method: 'POST' });
    setRows(data);
  };

  const handleApproveOne = async (sku) => {
    const updated = await apiRequest(`/pricing/${sku}/approve`, { method: 'POST' });
    setRows((prev) => prev.map((item) => (item.sku === sku ? updated : item)));
  };

  const handleOverride = async () => {
    const numeric = Number(overrideValue);
    if (!selected || Number.isNaN(numeric) || numeric <= 0) return;

    const updated = await apiRequest(`/pricing/${selectedSku}/override`, {
      method: 'PATCH',
      body: JSON.stringify({ price: numeric }),
    });
    setRows((prev) => prev.map((item) => (item.sku === selectedSku ? updated : item)));

    setOverrideValue('');
  };

  const handleRecalculate = async () => {
    const data = await apiRequest('/pricing/recalculate', { method: 'POST' });
    setRows(data);
  };

  if (isLoading) {
    return <article className="card empty-state">Loading pricing recommendations...</article>;
  }

  if (error) {
    return (
      <article className="card empty-state">
        <h3>Pricing API unavailable</h3>
        <p className="muted">{error}</p>
      </article>
    );
  }

  return (
    <section className="page-stack">
      <article className="card analytics-hero">
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80"
          alt="Pricing center"
          loading="lazy"
        />
        <div className="analytics-hero-copy">
          <p className="eyebrow">Pricing center</p>
          <h2>Recommendation queue and approval flow</h2>
          <p>
            Configure and approve model-generated prices with business constraints and
            transparent overrides.
          </p>
          <div className="signal-grid">
            <div className="signal-card">
              <small>Pending</small>
              <strong>{summary.pending}</strong>
            </div>
            <div className="signal-card">
              <small>Approved</small>
              <strong>{summary.approved}</strong>
            </div>
            <div className="signal-card">
              <small>Overridden</small>
              <strong>{summary.overridden}</strong>
            </div>
            <div className="signal-card">
              <small>Queue health</small>
              <strong>Stable</strong>
            </div>
          </div>
        </div>
      </article>

      <section className="analytics-grid">
        <article className="card span-6">
          <div className="section-head">
            <h3>Price recommendation queue</h3>
            <div className="actions">
              <button type="button" className="button" onClick={handleApproveAll}>
                Approve all
              </button>
              <button type="button" className="button ghost" onClick={handleRecalculate}>
                Recalculate
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Current</th>
                  <th>Recommended</th>
                  <th>Elasticity</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.sku} onClick={() => setSelectedSku(row.sku)}>
                    <td>{row.sku}</td>
                    <td>{row.product}</td>
                    <td>{formatCurrency(row.currentPrice)}</td>
                    <td>{formatCurrency(row.recommendedPrice)}</td>
                    <td>{row.elasticity}</td>
                    <td>
                      <span className={`status-badge status-${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleApproveOne(row.sku);
                        }}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card span-6">
          <h3>Manual override</h3>
          <div className="override-block">
            <p className="muted">
              Selected SKU: <strong>{selected?.sku}</strong>
            </p>
            <p className="muted">
              Product: <strong>{selected?.product}</strong>
            </p>
            <label>
              Override price
              <input
                type="number"
                value={overrideValue}
                onChange={(event) => setOverrideValue(event.target.value)}
                placeholder="Enter custom value"
              />
            </label>
            <button type="button" className="button" onClick={handleOverride}>
              Apply override
            </button>
            <p className="muted">
              Confidence: <strong>{selected?.confidence}%</strong>
            </p>
          </div>

          <h3>Constraint templates</h3>
          <div className="scenario-grid">
            {queueStatuses.map((item) => (
              <article key={item.title} className="scenario-card">
                <p className="eyebrow">Constraint</p>
                <strong>{item.title}</strong>
                <span>{item.value}</span>
                <p className="muted">{item.description}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="card span-6">
          <h3>Simulation presets</h3>
          <div className="scenario-grid">
            {scenarioCards.map((item) => (
              <article key={item.title} className="scenario-card">
                <p className="eyebrow">Scenario</p>
                <strong>{item.title}</strong>
                <span>{item.change}</span>
                <p className="muted">{item.description}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="card span-6 activity-feed">
          <h3>Deployment and model events</h3>
          <ul>
            {activityFeed.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  );
}
