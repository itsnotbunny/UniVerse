// backend/middleware/role.js

/**
 * Middleware to check if the user has one of the required roles
 * @param {string|string[]} roles - A string or array of roles
 */
function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found in request.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied: Requires role ${allowedRoles.join(' or ')}` });
    }

    next();
  };
}

// Named exports for common roles
const isAdmin = requireRole('admin');
const isFaculty = requireRole('faculty');
const isCoordinator = requireRole('studentCoordinator');
const isStudent = requireRole('student');

module.exports = {
  requireRole,
  isAdmin,
  isFaculty,
  isCoordinator,
  isStudent,
};