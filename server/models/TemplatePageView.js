const mongoose = require('mongoose');

const templatePageViewSchema = new mongoose.Schema({
  page: { type: String, required: true, index: true },
  day: { type: Date, required: true, index: true },
  totalViews: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  uniqueVisitorHashes: { type: [String], default: [] }
}, {
  versionKey: false
});

templatePageViewSchema.index({ page: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('TemplatePageView', templatePageViewSchema);
