const User = require('../models/User');
const jwt = require('../utils/jwt');

const registerUser = async (req, res) => {
  try {
    const { name, email, role, club } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      role,
      club,
      isApproved: role === 'studentCoordinator' ? null : true // pending only if student coordinator
    });

    await user.save();

    const token = jwt.signToken(user); // Assuming you have a signToken util
    res.status(201).json({ token, user }); // ✅ send valid JSON back
  } catch (err) {
    console.error("❌ Error in registerUser:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

module.exports = {
  googleLogin,
  registerUser,
  getCurrentUser,
};
