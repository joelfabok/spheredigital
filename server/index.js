require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const contactRoutes = require('./routes/contact');
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const templateRoutes = require('./routes/templates');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/templates', templateRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'Sphere Digital API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Connect to MongoDB, but keep the API server running even if DB is unavailable.
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sphere-digital')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('MongoDB error:', err.message);
    console.error('API will continue running, but DB-backed endpoints may fail until MongoDB is available.');
  });
