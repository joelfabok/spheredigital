import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTemplateDelivery } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';

export default function TemplateDownloads() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState({ customerEmail: '', templates: [] });
  const { clearCart } = useCart();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Missing checkout session. Please use the link from Stripe success page.');
      setLoading(false);
      return;
    }

    getTemplateDelivery(sessionId)
      .then((res) => {
        setDelivery({
          customerEmail: res.data?.customerEmail || '',
          templates: Array.isArray(res.data?.templates) ? res.data.templates : []
        });
        clearCart();
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Could not load your downloads yet.');
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="templates-page">
      <section className="templates-hero">
        <p className="section-label">Digital Delivery</p>
        <h1>Your files are <em>ready to download</em></h1>
        <p>
          Save these files now and keep your confirmation email for your records.
          {delivery.customerEmail ? ` Purchase email: ${delivery.customerEmail}` : ''}
        </p>
        <div className="download-top-links">
          <Link to="/templates" className="btn-ghost">Back to Templates</Link>
          <Link to="/templates/license" className="btn-ghost">View License Terms</Link>
        </div>
      </section>

      {loading && <div className="page-loading">Loading your purchase...</div>}
      {!loading && error && <div className="template-alert error">{error}</div>}

      {!loading && !error && (
        <section className="delivery-grid">
          {delivery.templates.length === 0 && (
            <div className="template-alert">No downloadable items found for this session.</div>
          )}

          {delivery.templates.map((template) => {
            const imageUrl = normalizeImageUrl(template.imageUrl);
            return (
              <article key={template._id} className="template-store-card">
                <div
                  className="template-store-media"
                  style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                >
                  {!imageUrl && <span>Template file</span>}
                </div>
                <div className="template-store-meta">
                  <p>{template.category || 'website'}</p>
                  <h3>{template.name}</h3>
                  {template.downloadUrl ? (
                    <a
                      href={template.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary template-add-btn"
                    >
                      Download Template
                    </a>
                  ) : (
                    <p className="template-store-desc">
                      Download link is not configured yet. Contact support and include your purchase email.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
