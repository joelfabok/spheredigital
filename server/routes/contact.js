const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
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

const getEmailTransporter = () => {
  const smtpUrl = process.env.SMTP_URL;
  if (smtpUrl) {
    return nodemailer.createTransport(smtpUrl);
  }

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const passRaw = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const pass = String(passRaw || '').replace(/\s+/g, '');

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

// POST /api/contact/:id/reply - Send a reply email to contact and mark as replied (admin only)
router.post('/:id/reply', authMiddleware, async (req, res) => {
  try {
    const subject = String(req.body.subject || '').trim();
    const message = String(req.body.message || '').trim();

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
      return res.status(500).json({
        message: 'Email is not configured. Add SMTP_URL or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in server environment.'
      });
    }

    const fromEmail = process.env.MAIL_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
    if (!fromEmail) {
      return res.status(500).json({ message: 'Missing sender address. Set MAIL_FROM, EMAIL_FROM, SMTP_USER, or EMAIL_USER.' });
    }

    await transporter.sendMail({
      from: fromEmail,
      to: contact.email,
      subject,
      text: message
    });

    contact.status = 'replied';
    contact.repliedAt = new Date();
    contact.lastReply = {
      subject,
      message,
      sentAt: new Date()
    };
    await contact.save();

    res.json({ message: 'Reply email sent', contact });
  } catch (err) {
    res.status(500).json({
      message: 'Could not send reply email',
      error: err.message,
      details: err.response || err.code || null
    });
  }
});

module.exports = router;
