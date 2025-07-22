const User = require('../models/User');

// List of all faculty
const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('name email facultyRole isOnline');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching faculty' });
  }
};

module.exports = {
  getFacultyList
};
