// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Auth check
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

// ✅ Flexible role checker
const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized: No user in request' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires role: ${allowed.join(', ')}` });
    }
    next();
  };
};

// ✅ Shortcuts (for convenience)
const isAdmin = requireRole('admin');
const isFaculty = requireRole('faculty');
const isCoordinator = requireRole('studentCoordinator');
const isStudent = requireRole('student');

// ✅ Pending check
const checkPending = (req, res, next) => {
  if (req.user.role === 'pending') {
    return res.status(403).send('Your registration is still pending approval.');
  }
  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  isAdmin,
  isFaculty,
  isCoordinator,
  isStudent,
  checkPending
};
