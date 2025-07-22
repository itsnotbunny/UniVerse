// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('../utils/jwt');

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, role, club } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      role: email === 'samuel.g.priyanshu@gmail.com' ? 'admin' : role,
      club,
      isApproved: role === 'studentCoordinator' ? null : true
    });

    await user.save();
    const token = jwt.signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const googleLogin = async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Email and name required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found. Please register first." });
  }

  const token = jwt.signToken(user);
  res.json({ token, user });
};

const getCurrentUser = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  registerUser,
  googleLogin,
  getCurrentUser
};
