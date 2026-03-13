import { Link } from 'react-router-dom';

export default function TemplateLicense() {
  return (
    <div className="templates-page">
      <section className="templates-hero">
        <p className="section-label">License Terms</p>
        <h1>Template usage <em>license</em></h1>
        <p>
          This page explains what buyers can and cannot do with templates purchased from Sphere Digital.
        </p>
        <Link to="/templates" className="btn-ghost">Back to Templates</Link>
      </section>

      <section className="license-grid">
        <article className="license-card">
          <h2>You can</h2>
          <ul>
            <li>Use each purchased template for one client project or one personal/business website.</li>
            <li>Modify styles, sections, text, and media to fit your brand or client needs.</li>
            <li>Deploy the customized website to production.</li>
            <li>Create backup copies for development and version control.</li>
          </ul>
        </article>

        <article className="license-card">
          <h2>You cannot</h2>
          <ul>
            <li>Resell, redistribute, or share the original template files.</li>
            <li>Offer the template as a downloadable product, freebie, or part of another kit.</li>
            <li>Use one purchase for multiple unrelated end customers.</li>
            <li>Claim the original template design as your own for resale.</li>
          </ul>
        </article>

        <article className="license-card full">
          <h2>Support and extended rights</h2>
          <p>
            Need multi-use rights, agency-wide licensing, or white-label redistribution rights? Contact Sphere Digital
            before launch so we can provide a custom license.
          </p>
          <p>
            Questions about allowed usage can be sent through the contact form on the homepage.
          </p>
        </article>
      </section>
    </div>
  );
}
