const express = require('express');
const router = express.Router();
const User = require('../models/User');

const {
  authMiddleware,
  isFaculty,
  checkPending,
} = require('../middleware/auth');
const { requireRole } = require('../middleware/role');


// ✅ Approve coordinator registrations
router.put('/approve-coordinator/:id', authMiddleware, checkPending, isFaculty, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    console.log("User being approved as coordinator:", user);
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
    console.log("Fetching pending faculty...");
    const pending = await User.find({ role: 'faculty', isApproved: null });
    console.log("Pending faculty: ", pending);
    res.json(pending);
  } catch (err) {
    console.error("❌ Failed to fetch pending faculty:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/faculty.js
router.get('/users', authMiddleware, requireRole('faculty'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/approve/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const faculty = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json(faculty);
});

router.patch('/reject/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const faculty = await User.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
  res.json(faculty);
});

module.exports = router;
