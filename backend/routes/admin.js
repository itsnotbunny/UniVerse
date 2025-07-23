const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  authMiddleware,
  isAdmin,
  checkPending,
} = require('../middleware/auth');
const { requireRole } = require('../middleware/role'); // ✅ Keep this one

const {
  getAllUsers,
  getCoordinatorsByClub,
  getAllFaculty,
} = require('../controllers/adminController');

// ✅ Apply protection for all routes under /admin
router.use(authMiddleware, requireRole('admin'));

// ✅ Routes
router.get('/users', getAllUsers);
router.get('/faculty', getAllFaculty);
router.get('/coordinators', getCoordinatorsByClub);

// ✅ Approve faculty
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

// ✅ Reject pending registration
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