const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  
  // Role-based access
  role: {
    type: String,
    enum: ['admin', 'faculty', 'studentCoordinator', 'student'],
    default: 'student'
  },

  // Only for faculty
  facultyRole: {
    type: String,
    enum: ['director', 'clubCoordinator', 'HOD', 'professor'],
    default: null
  },

  // Optional: for associating with a club
  club: { type: String },

  // Approval status for student coordinators
  isApproved: { type: Boolean, default: null },

  // Login-related fields
  googleId: String,              // For Google-authenticated users
  passwordHash: String,          // Optional: for admin-created users or fallback

  // Status tracking
  lastSeen: Date,
  isOnline: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
