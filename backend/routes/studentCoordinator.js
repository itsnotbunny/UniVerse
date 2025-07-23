const express = require('express');
const router = express.Router();
const ShowcaseItem = require('../models/ShowcaseItem');
const { authMiddleware, checkPending } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// ✅ Upload showcase
router.post('/showcase', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  try {
    const { club, title, description, imageUrl, linkUrl } = req.body;

    const item = new ShowcaseItem({
      club,
      title,
      description,
      imageUrl,
      linkUrl,
      createdBy: req.user._id
    });

    await item.save();
    res.status(201).json({ message: 'Showcase item uploaded', item });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// ✅ Get all showcase items (for students)
router.get('/showcase', authMiddleware, async (req, res) => {
  try {
    const items = await ShowcaseItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: 'Fetch failed' });
  }
});

module.exports = router;