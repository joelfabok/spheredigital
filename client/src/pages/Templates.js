import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkoutTemplates, getTemplates } from '../services/api';
import { useCart } from '../context/CartContext';
import { normalizeImageUrl } from '../utils/imageUrl';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [searchParams] = useSearchParams();

  const { items, itemCount, total, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

  useEffect(() => {
    getTemplates()
      .then(res => setTemplates(res.data || []))
      .catch(() => setError('Could not load templates right now.'))
      .finally(() => setLoading(false));
  }, []);

  const checkoutStatus = searchParams.get('status');

  const cartItems = useMemo(
    () => items.map(item => {
      const match = templates.find(t => String(t._id) === String(item.templateId));
      return {
        ...item,
        name: match?.name || item.name,
        price: typeof match?.price === 'number' ? match.price : item.price,
        salePrice: typeof match?.salePrice === 'number' ? match.salePrice : item.salePrice,
        onSale: typeof match?.onSale === 'boolean' ? match.onSale : item.onSale,
      };
    }),
    [items, templates]
  );

  const sortedTemplates = useMemo(() => {
    const list = [...templates];

    const getEffectivePrice = (template) => (
      template.onSale && typeof template.salePrice === 'number' ? template.salePrice : template.price
    );

    if (sortBy === 'price-low') {
      return list.sort((a, b) => (getEffectivePrice(a) || 0) - (getEffectivePrice(b) || 0));
    }

    if (sortBy === 'price-high') {
      return list.sort((a, b) => (getEffectivePrice(b) || 0) - (getEffectivePrice(a) || 0));
    }

    if (sortBy === 'name-az') {
      return list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }

    if (sortBy === 'name-za') {
      return list.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
    }

    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }

    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [templates, sortBy]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const payload = cartItems.map(item => ({ templateId: item.templateId, quantity: item.quantity }));
      const res = await checkoutTemplates(payload);
      if (!res.data?.url) throw new Error('Missing checkout URL');
      window.location.href = res.data.url;
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not start checkout.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="templates-page">
      <section className="templates-hero">
        <p className="section-label">Template Marketplace</p>
        <h1>Browse and buy production-ready <em>website templates</em></h1>
        <p>Pick a template, add it to your cart, and checkout securely with Stripe for instant digital delivery.</p>
        <p>
          By purchasing, you agree to the <Link to="/templates/license">template license terms</Link>.
        </p>
        <Link to="/" className="btn-ghost">Back to Home</Link>
      </section>

      {checkoutStatus === 'cancelled' && (
        <div className="template-alert">Checkout was cancelled. Your cart is still here.</div>
      )}
      {error && <div className="template-alert error">{error}</div>}

      <div className="template-toolbar">
        <p>{sortedTemplates.length} template{sortedTemplates.length === 1 ? '' : 's'}</p>
        <label htmlFor="template-sort">Sort by</label>
        <select
          id="template-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-az">Name: A to Z</option>
          <option value="name-za">Name: Z to A</option>
        </select>
      </div>

      <section className="templates-market">
        <div className="templates-catalog">
          {loading ? <div className="page-loading">Loading templates...</div> : sortedTemplates.map(template => {
            const price = template.onSale && typeof template.salePrice === 'number' ? template.salePrice : template.price;
            const imageUrl = normalizeImageUrl(template.imageUrl);
            const hasPreview = Boolean(template.previewHtml || template.previewUrl);
            return (
              <article key={template._id} className="template-store-card">
                <div
                  className="template-store-media"
                  style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                >
                  {!imageUrl && <span>Template preview</span>}
                  {template.onSale && typeof template.salePrice === 'number' && (
                    <div className="sale-badge">On Sale</div>
                  )}
                </div>
                <div className="template-store-meta">
                  <p>{template.category || 'website'}</p>
                  <h3>{template.name}</h3>
                  <p className="template-store-desc">{template.description}</p>
                  <div className="template-price-row">
                    <strong>${price}</strong>
                    {template.onSale && typeof template.salePrice === 'number' && <span>${template.price}</span>}
                  </div>
                  {hasPreview && (
                    <button
                      className="template-preview-btn"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      {template.previewHtml ? 'Preview HTML Site' : 'Preview Site'}
                    </button>
                  )}
                  <button className="btn-primary template-add-btn" onClick={() => addToCart(template)}>Add to Cart</button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="cart-panel">
          <h2>Cart ({itemCount})</h2>
          {cartItems.length === 0 && <p className="cart-empty">No templates added yet.</p>}
          {cartItems.map(item => {
            const unit = item.onSale && typeof item.salePrice === 'number' ? item.salePrice : item.price;
            return (
              <div key={item.templateId} className="cart-item">
                <div>
                  <h4>{item.name}</h4>
                  <p>${unit} each</p>
                </div>
                <div className="cart-actions">
                  <button onClick={() => updateQuantity(item.templateId, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.templateId, item.quantity + 1)}>+</button>
                  <button className="remove" onClick={() => removeFromCart(item.templateId)}>Remove</button>
                </div>
              </div>
            );
          })}

          <div className="cart-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>

          <button className="btn-primary cart-checkout" onClick={handleCheckout} disabled={cartItems.length === 0 || checkoutLoading}>
            {checkoutLoading ? 'Redirecting...' : 'Checkout with Stripe'}
          </button>
          <button className="cart-clear" onClick={clearCart} disabled={cartItems.length === 0}>Clear Cart</button>
        </aside>
      </section>

      {previewTemplate && (
        <div className="template-preview-modal" role="dialog" aria-modal="true" aria-label="Template preview">
          <div className="template-preview-shell">
            <div className="template-preview-head">
              <h3>{previewTemplate.name}</h3>
              <button type="button" className="template-preview-close" onClick={() => setPreviewTemplate(null)}>Close</button>
            </div>
            <div className="template-preview-frame-wrap">
              {previewTemplate.previewUrl ? (
                <iframe
                  title={`${previewTemplate.name} preview`}
                  src={previewTemplate.previewUrl}
                  className="template-preview-frame"
                  sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
                />
              ) : (
                <iframe
                  title={`${previewTemplate.name} preview`}
                  srcDoc={previewTemplate.previewHtml}
                  className="template-preview-frame"
                  sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
