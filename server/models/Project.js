const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['chat-system', 'web-app', 'digital-courses', 'scheduling', 'other'],
    required: true
  },
  description: { type: String, required: true },
  longDescription: { type: String },
  techStack: [{ type: String }],
  imageUrl: { type: String },
  imageUrls: [{ type: String }],
  liveUrl: { type: String },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
