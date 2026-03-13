import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkoutTemplates, getTemplates } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
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
        <p>Pick a template, add it to your cart, and checkout securely with Stripe.</p>
        <Link to="/" className="btn-ghost">Back to Home</Link>
      </section>

      {checkoutStatus === 'success' && (
        <div className="template-alert success">Payment successful. We will contact you with delivery details.</div>
      )}
      {checkoutStatus === 'cancelled' && (
        <div className="template-alert">Checkout was cancelled. Your cart is still here.</div>
      )}
      {error && <div className="template-alert error">{error}</div>}

      <section className="templates-market">
        <div className="templates-catalog">
          {loading ? <div className="page-loading">Loading templates...</div> : templates.map(template => {
            const price = template.onSale && typeof template.salePrice === 'number' ? template.salePrice : template.price;
            return (
              <article key={template._id} className="template-store-card">
                <div
                  className="template-store-media"
                  style={template.imageUrl ? { backgroundImage: `url(${template.imageUrl})` } : undefined}
                >
                  {!template.imageUrl && <span>Template preview</span>}
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
    </div>
  );
}
