const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'home' },
  servicesLabel: { type: String, default: 'What We Do' },
  servicesTitle: { type: String, default: 'Software that moves the needle' },
  workLabel: { type: String, default: 'Selected Work' },
  workTitle: { type: String, default: "Products we're proud of" },
  stats: {
    type: [{ value: String, label: String }],
    default: [
      { value: '12+', label: 'Projects Shipped' },
      { value: '50k+', label: 'Users Reached' },
      { value: '4', label: 'Product Categories' },
      { value: '100%', label: 'Client Satisfaction' }
    ]
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
