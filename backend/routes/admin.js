const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  authMiddleware,
  isAdmin,
  checkPending,
} = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Admin-only controllers
const {
  getAllUsers,
  getCoordinatorsByClub,
} = require('../controllers/adminController');

// ✅ Apply middleware globally for all admin routes
router.use(authMiddleware, requireRole('admin'));

// ✅ Get all users
router.get('/users', getAllUsers);

// ✅ Get approved student coordinators grouped by club
router.get('/coordinators', getCoordinatorsByClub);

// GET /api/admin/faculty
router.get('/faculty', requireRole(['admin']), async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty', isApproved: true });
    res.json(faculty);
  } catch (err) {
    console.error("Error fetching faculty:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Approve a faculty registration request
router.put('/approve-faculty/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.desiredRole !== 'faculty') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    user.role = 'faculty';
    user.desiredRole = undefined;
    await user.save();

    res.json({ message: 'Faculty approved', user });
  } catch (err) {
    console.error("Approve faculty error:", err);
    res.status(500).send("Server error");
  }
});

// ✅ Reject any pending registration
router.delete('/reject/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'pending') {
      return res.status(400).json({ message: 'Invalid or already processed user' });
    }

    await user.deleteOne();
    res.json({ message: 'User registration rejected and deleted' });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
