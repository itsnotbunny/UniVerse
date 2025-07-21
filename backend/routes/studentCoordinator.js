// backend/routes/studentCoordinator.js

const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');       // ✅ from auth.js
const { requireRole } = require('../middleware/role');          // ✅ from role.js

const router = express.Router();

// View pending student coordinator registrations
router.get('/pending', authMiddleware, requireRole('faculty'), async (req, res) => {
  if (req.user.facultyRole !== 'clubCoordinator') {
    return res.status(403).json({ message: 'Only Club Coordinators can view requests' });
  }

  const pendingCoordinators = await User.find({
    role: 'studentCoordinator',
    isApproved: null
  });

  res.json(pendingCoordinators);
});

// Approve or reject student coordinator
router.put('/:id/approval', authMiddleware, requireRole('faculty'), async (req, res) => {
  if (req.user.facultyRole !== 'clubCoordinator') {
    return res.status(403).json({ message: 'Only Club Coordinators can approve/reject' });
  }

  const { id } = req.params;
  const { approve } = req.body;

  const student = await User.findById(id);
  if (!student || student.role !== 'studentCoordinator') {
    return res.status(404).json({ message: 'Student Coordinator not found' });
  }

  student.isApproved = approve;
  await student.save();

  res.json({ message: `Student Coordinator ${approve ? 'approved' : 'rejected'}` });
});

module.exports = router;
