const mongoose = require('mongoose');

const showcaseItemSchema = new mongoose.Schema({
  club: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  linkUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShowcaseItem', showcaseItemSchema);