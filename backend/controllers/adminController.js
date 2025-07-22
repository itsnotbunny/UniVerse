const User = require('../models/User');

// View all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash'); // Exclude passwordHash
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// View all student coordinators by club
const getCoordinatorsByClub = async (req, res) => {
  try {
    const coordinators = await User.find({
      role: 'studentCoordinator',
      isApproved: true
    }).select('name email club');

    const grouped = {};
    coordinators.forEach(c => {
      if (!grouped[c.club]) grouped[c.club] = [];
      grouped[c.club].push(c);
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getCoordinatorsByClub
};
