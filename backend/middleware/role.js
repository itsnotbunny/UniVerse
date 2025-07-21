// backend/middleware/role.js

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Access denied: role mismatch' });
    }
    next();
  };
}

function isAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

function isFaculty(req, res, next) {
  return requireRole('faculty')(req, res, next);
}

function isCoordinator(req, res, next) {
  return requireRole('studentCoordinator')(req, res, next);
}

function isStudent(req, res, next) {
  return requireRole('student')(req, res, next);
}

module.exports = {
  requireRole,
  isAdmin,
  isFaculty,
  isCoordinator,
  isStudent,
};
