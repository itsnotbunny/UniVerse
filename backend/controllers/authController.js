const User = require('../models/User');
const jwt = require('../utils/jwt');

// Register User
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('../utils/jwt');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential || !role) {
      return res.status(400).json({ message: "Missing credential or role" });
    }

    // ✅ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const isAdmin = email === 'samuel.g.priyanshu@gmail.com';

    const user = new User({
      name,
      email,
      role: isAdmin ? 'admin' : role,
      isApproved: isAdmin ? true : role === 'studentCoordinator' ? null : true,
    });

    await user.save();
    const token = jwt.signToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    res.status(500).json({ message: "Registration failed" });
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
