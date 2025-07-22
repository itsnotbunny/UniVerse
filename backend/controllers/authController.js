const User = require('../models/User');
const jwt = require('../utils/jwt');

// --- Google login handler ---
const googleLogin = async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Email and name required" });
  }

  let user = await User.findOne({ email });

  if (!user) {
    // User doesn't exist, ask to register
    return res.status(404).json({ message: "User not found. Please register first." });
  }

  const token = jwt.signToken(user);
  res.json({ token, user });
};

// --- User registration handler ---
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
      role: email === 'samuel.g.priyanshu@gmail.com' ? 'admin' : role, // Make yourself admin
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

// --- Get current logged-in user ---
const getCurrentUser = async (req, res) => {
  res.json(req.user); // comes from authMiddleware
};

module.exports = {
  googleLogin,
  registerUser,
  getCurrentUser
};
