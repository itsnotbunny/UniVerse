const express = require('express');
const router = express.Router();

const {
  googleLogin,
  registerUser,
  getCurrentUser,
} = require('../controllers/authController');

const { authMiddleware } = require('../middleware/auth'); // ✅ Proper importconst { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role'); // ✅ Correct file


router.post('/google-login', googleLogin);
router.post('/register', registerUser);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
