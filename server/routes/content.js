const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const authMiddleware = require('../middleware/auth');

const defaultHomeContent = {
  servicesLabel: 'What We Do',
  servicesTitle: 'Software that moves the needle',
  workLabel: 'Selected Work',
  workTitle: "Products we're proud of",
  stats: [
    { value: '12+', label: 'Projects Shipped' },
    { value: '50k+', label: 'Users Reached' },
    { value: '4', label: 'Product Categories' },
    { value: '100%', label: 'Client Satisfaction' }
  ]
};

// GET /api/content/home - Public homepage text content
router.get('/home', async (req, res) => {
  try {
    const content = await SiteContent.findOne({ key: 'home' }).lean();
    if (!content) return res.json(defaultHomeContent);

    res.json({
      servicesLabel: content.servicesLabel || defaultHomeContent.servicesLabel,
      servicesTitle: content.servicesTitle || defaultHomeContent.servicesTitle,
      workLabel: content.workLabel || defaultHomeContent.workLabel,
      workTitle: content.workTitle || defaultHomeContent.workTitle,
      stats: Array.isArray(content.stats) && content.stats.length > 0 ? content.stats : defaultHomeContent.stats
    });
  } catch {
    // Keep frontend usable when DB is unavailable.
    res.json(defaultHomeContent);
  }
});

// PUT /api/content/home - Admin-only homepage text updates
router.put('/home', authMiddleware, async (req, res) => {
  try {
    const payload = {
      servicesLabel: req.body.servicesLabel,
      servicesTitle: req.body.servicesTitle,
      workLabel: req.body.workLabel,
      workTitle: req.body.workTitle,
      updatedAt: new Date()
    };

    if (Array.isArray(req.body.stats)) {
      payload.stats = req.body.stats.slice(0, 4);
    }

    const content = await SiteContent.findOneAndUpdate(
      { key: 'home' },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      servicesLabel: content.servicesLabel,
      servicesTitle: content.servicesTitle,
      workLabel: content.workLabel,
      workTitle: content.workTitle,
      stats: Array.isArray(content.stats) && content.stats.length > 0 ? content.stats : defaultHomeContent.stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not update homepage content', error: err.message });
  }
});

module.exports = router;
