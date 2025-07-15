const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, facultyRole: user.facultyRole },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = generateToken;
