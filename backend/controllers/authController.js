const User = require('../models/User');
const jwt = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER user
const registerUser = async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential || !role) {
      return res.status(400).json({ message: "Missing credential or role" });
    }

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

// LOGIN user
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Missing credential" });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("❌ googleLogin error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

const getCurrentUser = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  registerUser,
  googleLogin,
  getCurrentUser,
};