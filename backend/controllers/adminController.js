const User = require('../models/User');

// View all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name role');
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
    }).select('name club');

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

// ✅ Fixed: Include getAllFaculty inside the same object
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty', isApproved: true })
      .select('name facultyRole isOnline');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch faculty.' });
  }
};

module.exports = {
  getAllUsers,
  getCoordinatorsByClub,
  getAllFaculty
};