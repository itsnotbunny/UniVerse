const express = require('express');
const router = express.Router();
const User = require('../models/User');

const {
  authMiddleware,
  isFaculty,
  checkPending,
  requireRole,
} = require('../middleware/auth');

// ✅ Approve coordinator registrations
router.put('/approve-coordinator/:id', authMiddleware, checkPending, isFaculty, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.desiredRole !== 'studentCoordinator') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    user.role = 'studentCoordinator';
    user.desiredRole = undefined;
    await user.save();

    res.json({ message: 'Coordinator approved', user });
  } catch (err) {
    console.error("Coordinator approval error:", err);
    res.status(500).send("Server error");
  }
});

// ✅ Get all faculty who are not yet approved
router.get('/pending', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pending = await User.find({ role: 'faculty', isApproved: false });
    res.json(pending);
  } catch (err) {
    console.error("❌ Failed to fetch pending faculty:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
