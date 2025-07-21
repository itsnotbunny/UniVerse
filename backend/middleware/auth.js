// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Your existing middleware functions
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).send('Access denied');
  next();
};

const isFaculty = (req, res, next) => {
  if (req.user.role !== 'faculty') return res.status(403).send('Access denied');
  next();
};

const isCoordinator = (req, res, next) => {
  if (req.user.role !== 'studentCoordinator') return res.status(403).send('Access denied');
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') return res.status(403).send('Access denied');
  next();
};

const checkPending = (req, res, next) => {
  if (req.user.role === 'pending') {
    return res.status(403).send('Your registration is still pending approval.');
  }
  next();
};

// ✅ Export all middleware
module.exports = {
  authMiddleware,
  isAdmin,
  isFaculty,
  isCoordinator,
  isStudent,
  checkPending,
};
