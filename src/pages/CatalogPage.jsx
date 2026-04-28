import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { apiRequest } from '../api/client';
import { editorialCollections, heroGallery } from '../data/mockData';

const makeDefaultFilters = (minPrice = 0, maxPrice = 1000) => ({
  query: '',
  category: 'All',
  minPrice,
  maxPrice,
  minRating: 0,
  minDemand: 0,
  inStockOnly: false,
  sortBy: 'relevance',
});

const presetFilters = [
  { id: 'top-demand', label: 'Top demand', patch: { minDemand: 80, sortBy: 'demand-desc' } },
  { id: 'budget', label: 'Budget range', patch: { maxPrice: 100, sortBy: 'price-asc' } },
  {
    id: 'premium',
    label: 'Premium',
    patch: { minPrice: 200, minRating: 4.6, sortBy: 'rating-desc' },
  },
  { id: 'in-stock', label: 'In stock', patch: { inStockOnly: true, sortBy: 'relevance' } },
];

const sortProducts = (items, sortBy, watchlist) => {
  const sorted = [...items];

  if (sortBy === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
  if (sortBy === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
  if (sortBy === 'rating-desc') sorted.sort((a, b) => b.rating - a.rating);
  if (sortBy === 'demand-desc') sorted.sort((a, b) => b.demandIndex - a.demandIndex);
  if (sortBy === 'stock-desc') sorted.sort((a, b) => b.stock - a.stock);
  if (sortBy === 'watchlist-first') {
    sorted.sort((a, b) => Number(watchlist.has(b.id)) - Number(watchlist.has(a.id)));
  }

  if (sortBy === 'relevance') {
    sorted.sort((a, b) => b.demandIndex - a.demandIndex || b.rating - a.rating);
  }

  return sorted;
};

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(makeDefaultFilters());
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [watchlistIds, setWatchlistIds] = useState(() => new Set());
  const [compareIds, setCompareIds] = useState([]);
  const [queuedIds, setQueuedIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const data = await apiRequest('/products');
        if (!active) return;
        setProducts(data);
        const prices = data.map((product) => Number(product.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setFilters(makeDefaultFilters(minPrice, maxPrice));
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    [products]
  );

  const priceValues = useMemo(() => products.map((product) => Number(product.price)), [products]);
  const globalMinPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const globalMaxPrice = priceValues.length ? Math.max(...priceValues) : 1000;

  const filteredProducts = useMemo(() => {
    const normalized = filters.query.toLowerCase().trim();

    const filtered = products.filter((product) => {
      const matchesCategory = filters.category === 'All' || product.category === filters.category;
      const matchesQuery =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized);
      const matchesPrice =
        Number(product.price) >= filters.minPrice && Number(product.price) <= filters.maxPrice;
      const matchesRating = product.rating >= filters.minRating;
      const matchesDemand = product.demandIndex >= filters.minDemand;
      const matchesStock = !filters.inStockOnly || product.stock > 0;

      return (
        matchesCategory &&
        matchesQuery &&
        matchesPrice &&
        matchesRating &&
        matchesDemand &&
        matchesStock
      );
    });

    return sortProducts(filtered, filters.sortBy, watchlistIds);
  }, [filters, products, watchlistIds]);

  const topDemandProducts = useMemo(
    () => [...filteredProducts].sort((a, b) => b.demandIndex - a.demandIndex).slice(0, 3),
    [filteredProducts]
  );

  const pageSize = viewMode === 'grid' ? 6 : 4;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const comparedProducts = useMemo(
    () => products.filter((product) => compareIds.includes(product.id)),
    [compareIds, products]
  );

  const compareSummary = useMemo(() => {
    if (comparedProducts.length === 0) return null;

    const avgPrice = Math.round(
      comparedProducts.reduce((sum, item) => sum + Number(item.price), 0) / comparedProducts.length
    );
    const avgRating = (
      comparedProducts.reduce((sum, item) => sum + item.rating, 0) / comparedProducts.length
    ).toFixed(1);
    const avgDemand = Math.round(
      comparedProducts.reduce((sum, item) => sum + item.demandIndex, 0) / comparedProducts.length
    );

    return { avgPrice, avgRating, avgDemand };
  }, [comparedProducts]);

  const queueSummary = useMemo(
    () => ({
      queued: queuedIds.size,
      watchlisted: watchlistIds.size,
      compared: compareIds.length,
    }),
    [queuedIds, watchlistIds, compareIds]
  );

  const activeFilters = [];

  if (filters.query) activeFilters.push({ key: 'query', label: `Search: ${filters.query}` });
  if (filters.category !== 'All') activeFilters.push({ key: 'category', label: filters.category });
  if (filters.minPrice > globalMinPrice) {
    activeFilters.push({ key: 'minPrice', label: `Min: $${filters.minPrice}` });
  }
  if (filters.maxPrice < globalMaxPrice) {
    activeFilters.push({ key: 'maxPrice', label: `Max: $${filters.maxPrice}` });
  }
  if (filters.minRating > 0) {
    activeFilters.push({ key: 'minRating', label: `Rating ${filters.minRating}+` });
  }
  if (filters.minDemand > 0) {
    activeFilters.push({ key: 'minDemand', label: `Demand ${filters.minDemand}+` });
  }
  if (filters.inStockOnly) activeFilters.push({ key: 'inStockOnly', label: 'In stock only' });

  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setCurrentPage(1);
  };

  const clearFilterChip = (key) => {
    if (key === 'query') updateFilter({ query: '' });
    if (key === 'category') updateFilter({ category: 'All' });
    if (key === 'minPrice') updateFilter({ minPrice: globalMinPrice });
    if (key === 'maxPrice') updateFilter({ maxPrice: globalMaxPrice });
    if (key === 'minRating') updateFilter({ minRating: 0 });
    if (key === 'minDemand') updateFilter({ minDemand: 0 });
    if (key === 'inStockOnly') updateFilter({ inStockOnly: false });
  };

  const resetFilters = () => {
    setFilters(makeDefaultFilters(globalMinPrice, globalMaxPrice));
    setCurrentPage(1);
  };

  const toggleWatchlist = (productId) => {
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const queuePricing = (productId) => {
    setQueuedIds((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  const toggleCompare = (productId) => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }

      if (prev.length >= 3) {
        return [...prev.slice(1), productId];
      }

      return [...prev, productId];
    });
  };

  const pageButtons = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  if (isLoading) {
    return <article className="card empty-state">Loading products...</article>;
  }

  if (error) {
    return (
      <article className="card empty-state">
        <h3>Backend is unavailable</h3>
        <p className="muted">{error}</p>
      </article>
    );
  }

  return (
    <section className="page-stack">
      <article className="card catalog-banner">
        <img src={heroGallery[2].image} alt="Product intelligence" loading="lazy" />
        <div className="catalog-banner-copy">
          <p className="eyebrow">Product intelligence</p>
          <h2>Demand-sensitive product monitoring</h2>
          <p>
            Explore product signals, queue items for pricing review, and compare candidates
            before approval in the pricing center.
          </p>
        </div>
      </article>

      <article className="card catalog-filter-panel">
        <div className="preset-row">
          {presetFilters.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-chip"
              onClick={() => updateFilter(preset.patch)}
            >
              {preset.label}
            </button>
          ))}
          <button type="button" className="preset-chip clear" onClick={resetFilters}>
            Reset all
          </button>
        </div>

        <div className="filter-grid-advanced">
          <label>
            Search
            <input
              type="text"
              value={filters.query}
              onChange={(event) => updateFilter({ query: event.target.value })}
              placeholder="Search products"
            />
          </label>

          <label>
            Category
            <select
              value={filters.category}
              onChange={(event) => updateFilter({ category: event.target.value })}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort by
            <select value={filters.sortBy} onChange={(event) => updateFilter({ sortBy: event.target.value })}>
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating-desc">Rating</option>
              <option value="demand-desc">Demand index</option>
              <option value="stock-desc">Stock level</option>
              <option value="watchlist-first">Watchlist first</option>
            </select>
          </label>

          <label>
            Min price
            <input
              type="number"
              min={globalMinPrice}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(event) => {
                const next = Number(event.target.value);
                updateFilter({ minPrice: Math.min(next || globalMinPrice, filters.maxPrice) });
              }}
            />
          </label>

          <label>
            Max price
            <input
              type="number"
              min={filters.minPrice}
              max={globalMaxPrice}
              value={filters.maxPrice}
              onChange={(event) => {
                const next = Number(event.target.value);
                updateFilter({ maxPrice: Math.max(next || globalMaxPrice, filters.minPrice) });
              }}
            />
          </label>

          <label>
            Min rating
            <select
              value={filters.minRating}
              onChange={(event) => updateFilter({ minRating: Number(event.target.value) })}
            >
              <option value={0}>Any</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
              <option value={4.7}>4.7+</option>
            </select>
          </label>

          <label>
            Demand floor ({filters.minDemand})
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.minDemand}
              onChange={(event) => updateFilter({ minDemand: Number(event.target.value) })}
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(event) => updateFilter({ inStockOnly: event.target.checked })}
            />
            Active signal only
          </label>
        </div>

        <div className="catalog-toolbar">
          <div className="view-switch">
            <button
              type="button"
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>

          <p className="muted catalog-result-text">
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </p>
        </div>

        {activeFilters.length > 0 ? (
          <div className="active-filter-row">
            {activeFilters.map((item) => (
              <button
                key={item.key}
                type="button"
                className="active-filter-chip"
                onClick={() => clearFilterChip(item.key)}
              >
                {item.label} x
              </button>
            ))}
          </div>
        ) : null}
      </article>

      <section className="mini-insights">
        {topDemandProducts.map((item) => (
          <article key={item.id} className="card mini-insight-card">
            <img src={item.image} alt={item.name} loading="lazy" />
            <div>
              <p className="eyebrow">Top demand</p>
              <strong>{item.name}</strong>
              <p className="muted">Demand index: {item.demandIndex}</p>
            </div>
          </article>
        ))}
      </section>

      <article className="card queue-summary-row">
        <div>
          <p className="eyebrow">Workflow counters</p>
          <strong>Queued for pricing: {queueSummary.queued}</strong>
        </div>
        <div>
          <p className="eyebrow">Watchlist</p>
          <strong>{queueSummary.watchlisted}</strong>
        </div>
        <div>
          <p className="eyebrow">Comparison set</p>
          <strong>{queueSummary.compared} / 3</strong>
        </div>
      </article>

      {comparedProducts.length > 0 ? (
        <article className="card compare-bar">
          <div>
            <p className="eyebrow">Compare ({comparedProducts.length}/3)</p>
            <div className="compare-chip-row">
              {comparedProducts.map((item) => (
                <button key={item.id} type="button" onClick={() => toggleCompare(item.id)}>
                  {item.name} x
                </button>
              ))}
            </div>
          </div>

          <div className="compare-summary">
            <p>Avg price: ${compareSummary?.avgPrice}</p>
            <p>Avg rating: {compareSummary?.avgRating}</p>
            <p>Avg demand: {compareSummary?.avgDemand}</p>
          </div>

          <button type="button" className="button ghost" onClick={() => setCompareIds([])}>
            Clear comparison
          </button>
        </article>
      ) : null}

      <section className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              isWatchlisted={watchlistIds.has(product.id)}
              onToggleWatchlist={toggleWatchlist}
              isCompared={compareIds.includes(product.id)}
              onToggleCompare={toggleCompare}
              isQueued={queuedIds.has(product.id)}
              onQueuePricing={queuePricing}
            />
          ))
        ) : (
          <article className="card empty-state">
            <h3>No products found</h3>
            <p className="muted">Try clearing filters or changing query settings.</p>
          </article>
        )}
      </section>

      <article className="card pagination-bar">
        <button
          type="button"
          className="button ghost"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        >
          Prev
        </button>

        <div className="pagination-pages">
          {pageButtons.map((page) => (
            <button
              key={page}
              type="button"
              className={page === currentPage ? 'active' : ''}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="button ghost"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
      </article>

      <section className="lookbook-grid">
        {editorialCollections.map((item) => (
          <article key={item.id} className="card lookbook-card">
            <img src={item.image} alt={item.title} loading="lazy" />
            <div>
              <strong>{item.title}</strong>
              <p className="muted">{item.description}</p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
