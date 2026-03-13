import { useState } from 'react';
import { submitContact } from '../services/api';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', service: 'other', budget: '', message: ''
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus('validation');
      return;
    }
    setStatus('loading');
    try {
      await submitContact(form);
      setStatus('success');
      setForm({ name: '', email: '', company: '', service: 'other', budget: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="contact-form">
      <div className="form-row">
        <div className="form-group">
          <label>Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Company</label>
          <input name="company" value={form.company} onChange={handleChange} placeholder="Your company" />
        </div>
        <div className="form-group">
          <label>Service Needed</label>
          <select name="service" value={form.service} onChange={handleChange}>
            <option value="chat-system">Chat System</option>
            <option value="web-app">Web Application</option>
            <option value="digital-courses">Digital Courses Platform</option>
            <option value="scheduling">Scheduling System</option>
            <option value="custom">Custom Solution</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Budget Range</label>
        <select name="budget" value={form.budget} onChange={handleChange}>
          <option value="">Select a range</option>
          <option value="under-5k">Under $5,000</option>
          <option value="5k-15k">$5,000 – $15,000</option>
          <option value="15k-50k">$15,000 – $50,000</option>
          <option value="50k+">$50,000+</option>
          <option value="discuss">Let's discuss</option>
        </select>
      </div>
      <div className="form-group">
        <label>Message *</label>
        <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your project..." rows={5} />
      </div>

      {status === 'validation' && <p className="form-error">Please fill in all required fields.</p>}
      {status === 'error' && <p className="form-error">Something went wrong. Please try again.</p>}
      {status === 'success' && (
        <div className="form-success">✓ Message received — we'll be in touch within 24 hours.</div>
      )}

      <button className="form-submit" onClick={handleSubmit} disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send Message →'}
      </button>
    </div>
  );
}
