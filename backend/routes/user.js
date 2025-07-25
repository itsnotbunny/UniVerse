// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// ✅ Regular online status update (with auth)
router.put('/online-status', authMiddleware, async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'isOnline must be a boolean' });
    }

    await User.findByIdAndUpdate(req.user._id, { isOnline });
    console.log(`✅ User ${req.user.email} online status updated to: ${isOnline}`);
    
    res.json({ message: 'Online status updated successfully' });
  } catch (error) {
    console.error('❌ Error updating online status:', error);
    res.status(500).json({ message: 'Failed to update online status' });
  }
});

// ✅ Beacon fallback route (for page unload when regular fetch fails)
router.put('/online-status-beacon', async (req, res) => {
  try {
    const { isOnline, token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token required' });
    }

    // Verify token manually since we can't use middleware with beacon
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(user._id, { isOnline: false }); // Always set to false for beacon
    console.log(`✅ User ${user.email} set offline via beacon`);
    
    res.json({ message: 'Online status updated via beacon' });
  } catch (error) {
    console.error('❌ Error updating online status via beacon:', error);
    res.status(500).json({ message: 'Failed to update online status' });
  }
});

// ✅ Get current user info
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// ✅ Get all online users (for admin)
router.get('/online-users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const onlineUsers = await User.find({ isOnline: true })
      .select('name email role isOnline')
      .sort({ name: 1 });
      
    res.json(onlineUsers);
  } catch (error) {
    console.error('❌ Error fetching online users:', error);
    res.status(500).json({ message: 'Failed to fetch online users' });
  }
});

module.exports = router;