const EventRequest = require('../models/EventRequest');

const getPublicEvents = async (req, res) => {
  const events = await EventRequest.find({ isPublic: true })
    .select('title description clubName eventDate registrationLinks')
    .sort({ eventDate: 1 });

  res.json(events);
};

module.exports = {
  getPublicEvents
};
