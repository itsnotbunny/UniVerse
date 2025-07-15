const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate using JWT
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send("Access denied: No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) return res.status(401).send("Invalid token: User not found");

    next();
  } catch {
    res.status(400).send("Invalid token");
  }
};

// Role-based authorization
const requireRole = (roles, subRole = null) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).send(`Access denied: Requires ${allowedRoles.join(' or ')}`);
    }

    // Special check: only approved student coordinators are allowed
    if (req.user.role === 'studentCoordinator' && req.user.approved !== true) {
      return res.status(403).send("Access denied: Coordinator not yet approved");
    }

    // Sub-role check (e.g., 'director', 'hod' etc.)
    if (subRole && req.user.subRole !== subRole) {
      return res.status(403).send(`Access denied: Requires sub-role ${subRole}`);
    }

    next();
  };
};

// Admin-only access
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Admins only");
  }
  next();
};

module.exports = { authMiddleware, requireRole, isAdmin };
