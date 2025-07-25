// routes/user.js (create if not present)
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const { updateOnlineStatus } = require('..controllers/userCOntroller');

router.put('/online-status', authMiddleware, async (req, res) => {
  const { isOnline } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline });
    res.send("Online status updated");
  } catch (err) {
    console.error("Error updating online status:", err);
    res.status(500).send("Failed to update online status");
  }
});

module.exports = router;