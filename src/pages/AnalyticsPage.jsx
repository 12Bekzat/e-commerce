import {
  activityFeed,
  demandByHour,
  marketSignals,
  regionalPerformance,
  scenarioCards,
} from '../data/mockData';
import { useMemo, useState } from 'react';

const baseDiagnostics = [
  { label: 'MAPE', value: 92 },
  { label: 'Data freshness', value: 87 },
  { label: 'RL reward stability', value: 84 },
];

const recommendationRows = [
  { sku: 'SKU-1042', name: 'Aurora Wireless Earbuds', elasticity: -1.43, recommendation: '$84' },
  { sku: 'SKU-1031', name: 'Vista 27" 4K Display', elasticity: -1.12, recommendation: '$379' },
  { sku: 'SKU-2209', name: 'Atlas Office Chair', elasticity: -0.94, recommendation: '$255' },
  { sku: 'SKU-1419', name: 'Pulse Fitness Band', elasticity: -1.21, recommendation: '$124' },
  { sku: 'SKU-1780', name: 'Orbit Portable SSD 1TB', elasticity: -0.76, recommendation: '$154' },
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('7d');
  const [region, setRegion] = useState('All');
  const [volatilityGuard, setVolatilityGuard] = useState(22);

  const diagnostics = useMemo(
    () =>
      baseDiagnostics.map((item) => ({
        ...item,
        value: Math.max(70, Math.min(99, item.value + (timeframe === '30d' ? 2 : 0))),
      })),
    [timeframe]
  );

  const filteredRegions = useMemo(() => {
    if (region === 'All') return regionalPerformance;
    return regionalPerformance.filter((item) => item.name === region);
  }, [region]);

  return (
    <section className="page-stack">
      <article className="card analytics-hero">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80"
          alt="Analytics dashboard"
          loading="lazy"
        />
        <div className="analytics-hero-copy">
          <p className="eyebrow">Analytics</p>
          <h2>Forecasting, elasticity and model behavior monitoring</h2>
          <p>
            Monitor core metrics, evaluate scenario outcomes and inspect pricing recommendations
            under selected business constraints.
          </p>
          <div className="filters">
            <label>
              Timeframe
              <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
                <option value="24h">24h</option>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
              </select>
            </label>
            <label>
              Region
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
                <option value="All">All</option>
                {regionalPerformance.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Volatility guard {volatilityGuard}%
              <input
                type="range"
                min="5"
                max="40"
                value={volatilityGuard}
                onChange={(event) => setVolatilityGuard(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="signal-grid">
            {marketSignals.map((signal) => (
              <div key={signal.label} className="signal-card">
                <small>{signal.label}</small>
                <strong>{signal.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </article>

      <section className="analytics-grid">
        <article className="card span-6">
          <h3>Peak Demand by Hour</h3>
          <div className="vertical-chart">
            {demandByHour.map((point) => (
              <div key={point.label} className="chart-col">
                <div className="bar-track">
                  <span style={{ height: `${point.value}%` }} />
                </div>
                <small>{point.label}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card span-6">
          <h3>Regional Performance</h3>
          <div className="region-list">
            {filteredRegions.map((item) => (
              <div key={item.name} className="region-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>Demand score: {item.score}</p>
                </div>
                <span className="tag">+{item.uplift}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="card span-6">
          <h3>Model diagnostics</h3>
          <div className="diagnostic-list">
            {diagnostics.map((item) => (
              <div key={item.label} className="diagnostic-row">
                <div className="summary-row">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="progress-track">
                  <i style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card span-6">
          <h3>Scenario simulation</h3>
          <div className="scenario-grid">
            {scenarioCards.map((scenario) => (
              <article key={scenario.title} className="scenario-card">
                <p className="eyebrow">Simulation</p>
                <strong>{scenario.title}</strong>
                <span>{scenario.change}</span>
                <p className="muted">{scenario.description}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <article className="card">
        <div className="section-head">
          <h3>Recommended Price Updates</h3>
          <div className="actions">
            <button type="button" className="button">
              Approve all
            </button>
            <button type="button" className="button ghost">
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
                <th>Elasticity</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {recommendationRows.map((item) => (
                <tr key={item.sku}>
                  <td>{item.sku}</td>
                  <td>{item.name}</td>
                  <td>{item.elasticity}</td>
                  <td>{item.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="card activity-feed">
        <h3>Model activity feed</h3>
        <ul>
          {activityFeed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
