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

    let isApproved;
    if(isAdmin) {
      isApproved = true;
    } else if (role === 'studentCoordinator') {
      isApproved = null;
    } else if (role === 'faculty') {
      isApproved = false;
    } else {
      isApproved = true;
    }

    const user = new User({
      name,
      email,
      role: isAdmin ? 'admin' : role,
      isApproved,
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
    if (!credential) {
      console.log("🚫 Missing credential in request body");
      return res.status(400).json({ message: "Missing credential" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("✅ Google token payload:", payload);

    const { email } = payload;
    if (!email) {
      console.log("🚫 No email found in payload");
      return res.status(400).json({ message: "Email not found in token" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ No user found with email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.role || !user.isApproved) {
      console.log("🚫 User not approved or missing role:", user);
      return res.status(403).json({ message: "User not approved or missing role" });
    }

    const token = jwt.signToken(user);
    console.log("✅ Login successful, returning token");
    res.status(200).json({ token, user });

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