const express = require('express');
const router = express.Router();
const Idea = require('../models/Idea');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Submit idea
router.post('/', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Idea text required' });

  const idea = new Idea({
    text,
    submittedBy: req.user._id
  });

  await idea.save();
  res.status(201).json(idea);
});

// Get all ideas submitted by this student coordinator
router.get('/my', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  const ideas = await Idea.find({ submittedBy: req.user._id }).sort({ submittedAt: -1 });
  res.json(ideas);
});

module.exports = router;
