// backend/routes/faculty.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { authMiddleware, isFaculty, checkPending } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// ✅ GET pending student coordinators (for faculty)
router.get('/pending-coordinators', authMiddleware, requireRole('faculty'), async (req, res) => {
  try {
    const pending = await User.find({ role: 'studentCoordinator', isApproved: null });
    res.json(pending);
  } catch (err) {
    console.error("❌ Error fetching pending coordinators:", err);
    res.status(500).json({ message: 'Failed to fetch pending coordinators' });
  }
});


// ✅ Approve student coordinator registrations (faculty only)
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

// ✅ Reject student coordinator registrations (faculty only)
router.delete('/reject-coordinator/:id', authMiddleware, checkPending, isFaculty, async (req, res) => {
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

// ✅ Admin: Get list of faculty pending approval
router.get('/pending', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pending = await User.find({ role: 'faculty', isApproved: null });
    res.json(pending);
  } catch (err) {
    console.error("❌ Failed to fetch pending faculty:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Faculty-only route: View all users
router.get('/users', authMiddleware, requireRole('faculty'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin: Approve/reject faculty
router.patch('/approve/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const faculty = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json(faculty);
});

router.patch('/reject/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const faculty = await User.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
  res.json(faculty);
});

// ✅ Used by Coordinator Dashboard to list all faculty
router.get('/list', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty', isApproved: true }).select('name email facultyRole isOnline');
    res.json(faculty);
  } catch (err) {
    console.error("❌ Error fetching faculty list:", err);
    res.status(500).json({ message: 'Failed to fetch faculty list' });
  }
});

// List all approved coordinators
router.get('/approved-coordinators', authMiddleware, requireRole('faculty'), async (req, res) => {
  try {
    const list = await User.find({ role: 'studentCoordinator', isApproved: true })
      .select('name email club');
    res.json(list);
  } catch (err) {
    console.error("❌ Error fetching approved coordinators:", err);
    res.status(500).json({ message: 'Failed to fetch coordinators' });
  }
});

module.exports = router;