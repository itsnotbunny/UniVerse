const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clubName: { type: String, default: '' },   // ✅ make optional
  eventDate: { type: Date, required: true },
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  facultyApprovals: [
    {
      faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      read: { type: Boolean, default: false },
      approved: { type: Boolean, default: null },
      comment: String,
      respondedAt: Date
    }
  ],

  isPublic: { type: Boolean, default: false },
  registrationLinks: { type: [String], default: [] },  // ✅ default empty array
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
