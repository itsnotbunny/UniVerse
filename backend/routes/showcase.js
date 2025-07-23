const express = require('express');
const router = express.Router();
const ShowcaseItem = require('../models/ShowcaseItem');
const { authMiddleware, isCoordinator } = require('../middleware/auth');

// Get public showcase items
router.get('/public', async (req, res) => {
  try {
    const items = await ShowcaseItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching showcase items" });
  }
});

// Coordinator can add a new item
router.post('/', authMiddleware, isCoordinator, async (req, res) => {
  try {
    const { club, title, description, imageUrl, linkUrl } = req.body;

    const newItem = new ShowcaseItem({
      club,
      title,
      description,
      imageUrl,
      linkUrl,
      createdBy: req.user._id,
    });

    await newItem.save();
    res.status(201).json({ message: "Showcase item created", newItem });
  } catch (err) {
    console.error("❌ Showcase create error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;