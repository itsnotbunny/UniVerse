// Add this in middleware/auth.js below the existing middleware exports

const checkPending = (req, res, next) => {
  if (req.user.role === 'pending') {
    return res.status(403).send('Your registration is still pending approval.');
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isFaculty,
  isCoordinator,
  isStudent,
  checkPending,
};
