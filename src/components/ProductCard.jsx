import { useMemo, useState } from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductCard({
  product,
  viewMode = 'grid',
  isWatchlisted = false,
  onToggleWatchlist,
  isCompared = false,
  onToggleCompare,
  isQueued = false,
  onQueuePricing,
}) {
  const [simulatedDelta] = useState(() => ((Math.random() * 6 - 3).toFixed(1)));

  const projectedPrice = useMemo(() => {
    const deltaFactor = 1 + Number(simulatedDelta) / 100;
    return Math.max(10, Math.round(product.price * deltaFactor));
  }, [product.price, simulatedDelta]);

  return (
    <article className={`card product-card ${viewMode === 'list' ? 'product-card-list' : ''}`}>
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />

        <button
          type="button"
          className={`favorite-button ${isWatchlisted ? 'active' : ''}`}
          onClick={() => onToggleWatchlist?.(product.id)}
          aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isWatchlisted ? '*' : '+'}
        </button>

        <div className="image-badges">
          <span className="pill">{product.category}</span>
          <span className="stock-pill">Signal {product.demandIndex}</span>
        </div>
      </div>

      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>

        <div className="product-meta">
          <span>{formatCurrency(product.price)}</span>
          <small>Elasticity proxy: {(product.demandIndex / 100).toFixed(2)}</small>
        </div>

        <div className="product-rating">
          <span>Rating {product.rating}</span>
          <small>{product.reviews} reviews</small>
        </div>

        <div className="projection-row">
          <small>Suggested price: {formatCurrency(projectedPrice)}</small>
          <small className={Number(simulatedDelta) >= 0 ? 'up' : 'down'}>{simulatedDelta}%</small>
        </div>

        <div className="product-actions">
          <button type="button" className="button" onClick={() => onQueuePricing?.(product.id)}>
            {isQueued ? 'Queued' : 'Queue for pricing'}
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => onToggleCompare?.(product.id)}
          >
            {isCompared ? 'Compared' : 'Compare'}
          </button>
        </div>
      </div>
    </article>
  );
}
