const User = require('../models/User');

const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    await User.findByIdAndUpdate(req.user._id, { isOnline });
    res.status(200).json({ message: "Online status updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = { updateOnlineStatus };