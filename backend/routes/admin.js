const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const {
  getAllUsers,
  getCoordinatorsByClub,
  getAllFaculty
} = require('../controllers/adminController');

// ✅ Protect all routes under /admin
router.use(authMiddleware, requireRole('admin'));

// ✅ GET routes
router.get('/users', getAllUsers);
router.get('/faculty', getAllFaculty);
router.get('/coordinators', getCoordinatorsByClub);

// ✅ PUT /approve-faculty/:id
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

// ✅ DELETE /reject/:id
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