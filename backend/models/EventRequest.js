const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema({
  title: String,
  description: String,
  clubName: String,
  eventDate: Date,
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  facultyApprovals: [
    {
      faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      read: { type: Boolean, default: false },
      approved: { type: Boolean, default: null }, // null = pending, true/false = approve/reject
      comment: String,
      respondedAt: Date
    }
  ],

  isPublic: { type: Boolean, default: false },
  registrationLinks: [String],
  organisingFlow: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Partially Approved'],
    default: 'Pending'
  },

  suggestedEdits: {
    type: String,
    default: ''
  }

});

module.exports = mongoose.model('EventRequest', eventRequestSchema);
