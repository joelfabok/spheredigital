const express = require('express');
const Stripe = require('stripe');
const Template = require('../models/Template');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

const fallbackTemplates = [
  {
    _id: 'fallback-1',
    name: 'Studio Starter',
    slug: 'studio-starter',
    description: 'A polished 5-page business template with conversion sections and strong visual hierarchy.',
    category: 'business',
    features: ['Landing + Services + Contact', 'Responsive layout', 'Fast setup'],
    price: 149,
    salePrice: 99,
    onSale: true,
    active: true
  },
  {
    _id: 'fallback-2',
    name: 'Course Launch Kit',
    slug: 'course-launch-kit',
    description: 'A high-converting template for creators launching digital courses and memberships.',
    category: 'digital-product',
    features: ['Offer sections', 'Pricing blocks', 'FAQ and testimonials'],
    price: 199,
    onSale: false,
    active: true
  },
  {
    _id: 'fallback-3',
    name: 'Agency Showcase',
    slug: 'agency-showcase',
    description: 'A premium portfolio template with case studies, testimonials, and clear CTA flow.',
    category: 'portfolio',
    features: ['Case study pages', 'Lead capture', 'Clean animations'],
    price: 249,
    salePrice: 199,
    onSale: true,
    active: true
  }
];

const getEffectivePrice = (template) => {
  if (template.onSale && typeof template.salePrice === 'number' && template.salePrice >= 0) {
    return template.salePrice;
  }
  return template.price;
};

// GET /api/templates - Public template list
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find({ active: true }).sort({ createdAt: -1 }).lean();
    res.json(templates);
  } catch {
    // Graceful fallback if DB is offline.
    res.json(fallbackTemplates);
  }
});

// GET /api/templates/admin - All templates for admin management
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const templates = await Template.find({}).sort({ createdAt: -1 }).lean();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Could not load templates', error: err.message });
  }
});

// POST /api/templates - Create template (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const template = new Template(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Could not create template', error: err.message });
  }
});

// PUT /api/templates/:id - Update template (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Could not update template', error: err.message });
  }
});

// DELETE /api/templates/:id - Delete template (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete template', error: err.message });
  }
});

// POST /api/templates/checkout - Create Stripe checkout session
router.post('/checkout', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe is not configured. Add STRIPE_SECRET_KEY to server env.' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const ids = items.map(item => item.templateId);
    let templates = [];

    try {
      templates = await Template.find({ _id: { $in: ids }, active: true }).lean();
    } catch {
      templates = fallbackTemplates.filter(t => ids.includes(t._id));
    }

    const line_items = [];

    for (const item of items) {
      const match = templates.find(t => String(t._id) === String(item.templateId));
      if (!match) continue;

      const unitAmount = Math.round(getEffectivePrice(match) * 100);
      line_items.push({
        quantity: Math.max(1, Number(item.quantity) || 1),
        price_data: {
          currency: 'usd',
          product_data: {
            name: match.name,
            description: match.description
          },
          unit_amount: unitAmount
        }
      });
    }

    if (line_items.length === 0) {
      return res.status(400).json({ message: 'No purchasable templates found in cart' });
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${baseUrl}/templates?status=success`,
      cancel_url: `${baseUrl}/templates?status=cancelled`
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Could not create checkout session', error: err.message });
  }
});

module.exports = router;
