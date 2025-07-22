const User = require('../models/User');
const jwt = require('../utils/jwt');

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const isAdmin = email === 'samuel.g.priyanshu@gmail.com'; // <- change to your email

    const user = new User({
      name,
      email,
      role: isAdmin ? 'admin' : role,
      isApproved: isAdmin ? true : role === 'studentCoordinator' ? null : true
    });

    await user.save();

    const token = jwt.signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login after registration
const googleLogin = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = jwt.signToken(user);
  res.json({ token, user });
};

const getCurrentUser = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  registerUser,
  googleLogin,
  getCurrentUser,
};
