// backend/routes/showcase.js

const express = require('express');
const router = express.Router();
const ShowcaseItem = require('../models/ShowcaseItem');
const { authMiddleware, isCoordinator } = require('../middleware/auth');

// 🔄 GET public showcase items (for students)
router.get('/', async (req, res) => {
  try {
    const items = await ShowcaseItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ Error fetching showcase items:", err);
    res.status(500).json({ message: "Failed to fetch showcase items" });
  }
});

// 🆕 POST a new showcase item (coordinator only)
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
    res.status(201).json({ message: "Showcase item created", item: newItem });
  } catch (err) {
    console.error("❌ Showcase create error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;