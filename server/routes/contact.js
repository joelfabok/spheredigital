const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/auth');

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, company, service, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const contact = new Contact({ name, email, company, service, budget, message });
    await contact.save();

    res.status(201).json({ message: 'Message received! We\'ll be in touch soon.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/contact - Get all contacts (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/contact/:id - Update contact status (admin only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
