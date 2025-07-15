const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Club coordinator approves student coordinator
router.put('/approve-student/:studentId', authMiddleware, requireRole('faculty', 'club_coordinator'), async (req, res) => {
  const student = await User.findById(req.params.studentId);
  if (!student || student.role !== 'student_coordinator')
    return res.status(404).send("Student coordinator not found");

  student.isApproved = true;
  await student.save();

  res.send("Student coordinator approved");
});

module.exports = router;
