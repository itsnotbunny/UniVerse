// backend/controllers/adminController.js
const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Admin: getAllUsers error", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllUsers };
