const User = require('../models/User');
const Idea = require('../models/Idea');

// Get current user ideas
const getIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ createdBy: req.user._id });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching ideas' });
  }
};

// Post a new idea
const postIdea = async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: "Idea text required" });

  const idea = new Idea({
    text,
    createdBy: req.user._id
  });

  await idea.save();
  res.status(201).json(idea);
};

module.exports = {
  getIdeas,
  postIdea
};
