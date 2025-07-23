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
// ✅ Fix logic: handle users who are already studentCoordinator but not yet approved
router.put('/approve-coordinator/:id', authMiddleware, checkPending, isFaculty, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'studentCoordinator' || user.isApproved !== null) {
      return res.status(400).json({ message: 'Invalid or already approved user' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Coordinator approved', user });
  } catch (err) {
    console.error("Coordinator approval error:", err);
    res.status(500).send("Server error");
  }
});

router.put('/reject-coordinator/:id', authMiddleware, checkPending, isFaculty, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'studentCoordinator' || user.isApproved !== null) {
      return res.status(400).json({ message: 'Invalid or already processed user' });
    }

    user.isApproved = false;
    await user.save();

    res.json({ message: 'Coordinator rejected', user });
  } catch (err) {
    console.error("Coordinator rejection error:", err);
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
