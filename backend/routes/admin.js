const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, isAdmin, requireRole } = require('../middleware/auth');

// Assign faculty role & subRole
router.put('/assign-role/:userId', authMiddleware, isAdmin, async (req, res) => {
  const { role, subRole, club } = req.body;

  if (role !== 'faculty') return res.status(400).send("Only faculty roles assignable here");

  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send("User not found");

  user.role = role;
  user.subRole = subRole;
  user.club = club || null;

  await user.save();
  res.send("Role updated successfully");
});

// Assign sub-role
router.post('/assign-role', authMiddleware, isAdmin, async (req, res) => {
  const { facultyId, subRole } = req.body;

  try {
    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).send("Faculty member not found");
    }

    faculty.subRole = subRole;
    await faculty.save();
    res.send("Sub-role assigned successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error assigning sub-role");
  }
});

// Get all faculty
router.get('/faculty', authMiddleware, requireRole('admin'), async (req, res) => {
  const faculty = await User.find({ role: 'faculty' }).select('name email facultyRole isOnline');
  res.json(faculty);
});

// 🔥 Get all users (for Admin Dashboard)
router.get('/users', authMiddleware, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('name email role facultyRole club isOnline');
  res.json(users);
});

module.exports = router;
