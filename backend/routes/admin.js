const express = require('express');
const router = express.Router();
const User = require('../models/User');

const {
  authMiddleware,
  isAdmin,
  checkPending,
} = require('../middleware/auth');

const { getAllUsers } = require('../controllers/adminController');



// ✅ Get all users (admin only)
router.get('/users', authMiddleware, checkPending, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error("Admin user fetch error:", err);
    res.status(500).send("Server error");
  }
});

// ✅ Approve faculty registration
router.put('/approve-faculty/:id', authMiddleware, isAdmin, async (req, res) => {
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
    console.error("Approve error:", err);
    res.status(500).send("Server error");
  }
});

// REJECT user registration (admin only)
router.delete('/reject/:id', authMiddleware, checkPending, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'pending') {
      return res.status(400).json({ message: 'Invalid or already processed user' });
    }

    await user.deleteOne();

    res.json({ message: 'User registration rejected and deleted' });
  } catch (err) {
    console.error("❌ Reject error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
