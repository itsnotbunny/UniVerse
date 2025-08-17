// backend/controllers/eventController.js
const EventRequest = require('../models/EventRequest');

const getPublicEvents = async (req, res) => {
  try {
    const events = await EventRequest.find({ isPublic: true })
      .select('title description eventDate')  // ✅ minimal fields
      .sort({ eventDate: 1 });

    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching public events:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getPublicEvents
};
