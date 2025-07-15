const express = require('express');
const jwt = require('../utils/jwt');
const User = require('../models/User');
const googleClient = require('../config/googleAuth');

const router = express.Router();

// Google login
router.post('/google-login', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, name, email } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId: sub });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt(user);
    res.json({ token, user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).send("Invalid Google token");
  }
});

const bcrypt = require('bcryptjs');

// Manual registration (for admins or password-based users)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      role,
      passwordHash,
    });

    await newUser.save();

    const token = jwt(newUser);
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Manual user login (email + password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash)
      return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
