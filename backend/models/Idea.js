const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  text: String,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Idea', ideaSchema);
