import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const roleLabel = (role) => (role === 'ROLE_ADMIN' ? 'Admin' : 'Analyst');

const defaultNewProduct = {
  sku: '',
  name: '',
  category: '',
  price: '',
  stock: '',
  rating: '4.5',
  reviews: '0',
  demandIndex: '50',
  image: '',
  description: '',
};

export default function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSku, setSelectedSku] = useState('');
  const [productDraft, setProductDraft] = useState({ price: '', stock: '', demandIndex: '' });
  const [newProduct, setNewProduct] = useState(defaultNewProduct);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const selectedProduct = useMemo(
    () => products.find((product) => product.sku === selectedSku),
    [products, selectedSku]
  );

  const loadAdminData = async () => {
    setError('');
    const [summaryData, usersData, productsData] = await Promise.all([
      apiRequest('/admin/summary'),
      apiRequest('/admin/users'),
      apiRequest('/products'),
    ]);
    setSummary(summaryData);
    setUsers(usersData);
    setProducts(productsData);
    setSelectedSku((prev) => prev || productsData[0]?.sku || '');
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [summaryData, usersData, productsData] = await Promise.all([
          apiRequest('/admin/summary'),
          apiRequest('/admin/users'),
          apiRequest('/products'),
        ]);
        if (!active) return;
        setSummary(summaryData);
        setUsers(usersData);
        setProducts(productsData);
        setSelectedSku(productsData[0]?.sku || '');
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    setProductDraft({
      price: selectedProduct.price,
      stock: selectedProduct.stock,
      demandIndex: selectedProduct.demandIndex,
    });
  }, [selectedProduct]);

  const refresh = async () => {
    setMessage('');
    try {
      await loadAdminData();
      setMessage('Admin data refreshed.');
    } catch (refreshError) {
      setError(refreshError.message);
    }
  };

  const updateRole = async (userId, role) => {
    setMessage('');
    setError('');
    try {
      const updated = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      setMessage('User role updated.');
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (!selectedProduct) return;

    setMessage('');
    setError('');
    try {
      const updated = await apiRequest(`/admin/products/${selectedProduct.sku}`, {
        method: 'PATCH',
        body: JSON.stringify({
          price: Number(productDraft.price),
          stock: Number(productDraft.stock),
          demandIndex: Number(productDraft.demandIndex),
        }),
      });
      setProducts((prev) =>
        prev.map((product) => (product.sku === selectedProduct.sku ? updated : product))
      );
      const summaryData = await apiRequest('/admin/summary');
      setSummary(summaryData);
      setMessage('Product signal updated.');
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const created = await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          sku: newProduct.sku,
          name: newProduct.name,
          category: newProduct.category,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          rating: Number(newProduct.rating),
          reviews: Number(newProduct.reviews),
          demandIndex: Number(newProduct.demandIndex),
          image: newProduct.image,
          description: newProduct.description,
        }),
      });

      setProducts((prev) => [...prev, created]);
      setSelectedSku(created.sku);
      setNewProduct(defaultNewProduct);
      const summaryData = await apiRequest('/admin/summary');
      setSummary(summaryData);
      setMessage('Product created and added to catalog.');
    } catch (createError) {
      setError(createError.message);
    }
  };

  if (isLoading) {
    return <article className="card empty-state">Loading admin workspace...</article>;
  }

  if (error && !summary) {
    return (
      <article className="card empty-state">
        <h3>Admin API unavailable</h3>
        <p className="muted">{error}</p>
      </article>
    );
  }

  return (
    <section className="page-stack admin-page">
      <article className="card admin-hero">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h2>System control workspace</h2>
          <p className="muted">
            Monitor platform state, manage user roles, and adjust product signals that feed the
            catalog and pricing workflow.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button type="button" className="button" onClick={refresh}>
            Refresh data
          </button>
          <span className="tag">Admin only</span>
        </div>
      </article>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="admin-kpi-grid">
        <article className="card stat">
          <p>Users</p>
          <strong>{summary?.users}</strong>
        </article>
        <article className="card stat">
          <p>Products</p>
          <strong>{summary?.products}</strong>
        </article>
        <article className="card stat">
          <p>Recommendations</p>
          <strong>{summary?.recommendations}</strong>
        </article>
        <article className="card stat">
          <p>Catalog value</p>
          <strong>{formatCurrency(summary?.catalogValue)}</strong>
        </article>
      </section>

      <article className="card admin-tabs">
        <button
          type="button"
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          type="button"
          className={activeTab === 'catalog' ? 'active' : ''}
          onClick={() => setActiveTab('catalog')}
        >
          Catalog control
        </button>
      </article>

      {activeTab === 'overview' ? (
        <section className="analytics-grid">
          <article className="card span-6">
            <h3>Pricing queue status</h3>
            <div className="admin-status-grid">
              <div>
                <small>Pending</small>
                <strong>{summary?.pendingRecommendations}</strong>
              </div>
              <div>
                <small>Approved</small>
                <strong>{summary?.approvedRecommendations}</strong>
              </div>
              <div>
                <small>Overridden</small>
                <strong>{summary?.overriddenRecommendations}</strong>
              </div>
              <div>
                <small>Average demand</small>
                <strong>{summary?.averageDemand}</strong>
              </div>
            </div>
          </article>

          <article className="card span-6 activity-feed">
            <h3>Admin notes</h3>
            <ul>
              {summary?.systemNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}

      {activeTab === 'users' ? (
        <article className="card">
          <div className="section-head">
            <h3>User management</h3>
            <p className="muted">Change access level without touching the database manually.</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current role</th>
                  <th>Created</th>
                  <th>Change role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="tag">{roleLabel(user.role)}</span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(event) => updateRole(user.id, event.target.value)}
                      >
                        <option value="ROLE_ANALYST">Analyst</option>
                        <option value="ROLE_ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      {activeTab === 'catalog' ? (
        <section className="analytics-grid">
          <article className="card span-6">
            <h3>Product signal editor</h3>
            <form className="form-stack" onSubmit={saveProduct}>
              <label>
                Product
                <select value={selectedSku} onChange={(event) => setSelectedSku(event.target.value)}>
                  {products.map((product) => (
                    <option key={product.sku} value={product.sku}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Price
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productDraft.price}
                  onChange={(event) =>
                    setProductDraft((prev) => ({ ...prev, price: event.target.value }))
                  }
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  value={productDraft.stock}
                  onChange={(event) =>
                    setProductDraft((prev) => ({ ...prev, stock: event.target.value }))
                  }
                />
              </label>
              <label>
                Demand index
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={productDraft.demandIndex}
                  onChange={(event) =>
                    setProductDraft((prev) => ({ ...prev, demandIndex: event.target.value }))
                  }
                />
              </label>
              <button type="submit" className="button">
                Save product signal
              </button>
            </form>
          </article>

          <article className="card span-6">
            <h3>Selected product</h3>
            {selectedProduct ? (
              <div className="admin-product-preview">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
                <div>
                  <p className="eyebrow">{selectedProduct.category}</p>
                  <strong>{selectedProduct.name}</strong>
                  <p className="muted">{selectedProduct.description}</p>
                  <div className="admin-status-grid compact">
                    <div>
                      <small>Price</small>
                      <strong>{formatCurrency(selectedProduct.price)}</strong>
                    </div>
                    <div>
                      <small>Stock</small>
                      <strong>{selectedProduct.stock}</strong>
                    </div>
                    <div>
                      <small>Demand</small>
                      <strong>{selectedProduct.demandIndex}</strong>
                    </div>
                    <div>
                      <small>Rating</small>
                      <strong>{selectedProduct.rating}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </article>

          <article className="card span-6">
            <h3>Add product</h3>
            <form className="form-stack" onSubmit={createProduct}>
              <label>
                SKU
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, sku: event.target.value }))
                  }
                  placeholder="SKU-3001"
                  required
                />
              </label>
              <label>
                Name
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Product name"
                  required
                />
              </label>
              <label>
                Category
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, category: event.target.value }))
                  }
                  placeholder="Accessories"
                  required
                />
              </label>
              <div className="admin-form-grid">
                <label>
                  Price
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(event) =>
                      setNewProduct((prev) => ({ ...prev, price: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(event) =>
                      setNewProduct((prev) => ({ ...prev, stock: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Rating
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newProduct.rating}
                    onChange={(event) =>
                      setNewProduct((prev) => ({ ...prev, rating: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Reviews
                  <input
                    type="number"
                    min="0"
                    value={newProduct.reviews}
                    onChange={(event) =>
                      setNewProduct((prev) => ({ ...prev, reviews: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label>
                Demand index
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newProduct.demandIndex}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, demandIndex: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Image URL
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, image: event.target.value }))
                  }
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={newProduct.description}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Short product description"
                  required
                />
              </label>
              <button type="submit" className="button">
                Add product
              </button>
            </form>
          </article>

          <article className="card span-6 activity-feed">
            <h3>Creation guide</h3>
            <ul>
              <li>SKU must be unique because the backend uses it as product identifier.</li>
              <li>Demand index should stay between 0 and 100 for catalog filters and analytics.</li>
              <li>Image URL is shown directly in Product Intelligence and admin preview.</li>
              <li>New products appear in the catalog immediately after creation.</li>
            </ul>
          </article>
        </section>
      ) : null}
    </section>
  );
}
