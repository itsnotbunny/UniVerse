const express = require('express');
const router = express.Router();
const sendMail = require('../utils/mailer');
const EventRequest = require('../models/EventRequest');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// 🔹 Student Coordinator: Submit new event
router.post('/', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  console.log("📥 Body at route entry:", req.body, " | Headers:", req.headers);

  const { title, description, eventDate, registrationLinks } = req.body;
  console.log("📥 Parsed:", { title, description, eventDate, registrationLinks });

  if (!title || !description || !eventDate) {
    return res.status(400).json({ message: "Missing or invalid fields in request" });
  }

  let parsedDate = new Date(eventDate);
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  try {
    const newEvent = new EventRequest({
      title,
      description,
      eventDate: parsedDate, // ✅ force Date conversion
      clubName: req.user.clubName || '',
      registrationLinks: registrationLinks || [],
      coordinator: req.user._id,
      facultyApprovals: [],
      isPublic: false,
      status: 'Pending'
    });

    await newEvent.save();
    console.log(`✅ Event "${title}" submitted by ${req.user.name}`);
    res.status(201).json(newEvent);

  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ message: "Server error while creating event" });
  }
});

// 🔹 Student Coordinator: Fetch own events
router.get('/sent', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  const events = await EventRequest.find({ coordinator: req.user._id });
  res.json(events);
});

// 🔹 Student Coordinator: Update organisation flow
router.put('/:eventId/organisation', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  const { organisingFlow } = req.body;
  const { eventId } = req.params;

  const event = await EventRequest.findById(eventId);
  if (!event) return res.status(404).send("Event not found");
  if (event.coordinator.toString() !== req.user._id.toString()) {
    return res.status(403).send("Not authorized to edit this event");
  }

  event.organisingFlow = organisingFlow;
  await event.save();
  res.send("Organising flow updated");
});

// 🔹 Faculty: Approve/reject event
router.put('/:eventId/respond', authMiddleware, requireRole('faculty'), async (req, res) => {
  const { eventId } = req.params;
  const { approved, comment } = req.body;

  const event = await EventRequest.findById(eventId);
  if (!event) return res.status(404).send("Event not found");

  const approval = event.facultyApprovals.find(
    a => a.faculty.toString() === req.user._id.toString()
  );

  if (!approval) return res.status(403).send("You are not assigned to this event");

  approval.read = true;
  approval.approved = approved;
  approval.comment = comment;
  approval.respondedAt = new Date();

  await event.save();
  res.send("Event decision recorded");
});

// 🔹 Faculty: Suggest edits
router.put('/:eventId/suggest-edits', authMiddleware, requireRole('faculty'), async (req, res) => {
  const { eventId } = req.params;
  const { comment } = req.body;

  const event = await EventRequest.findById(eventId);
  if (!event) return res.status(404).send("Event not found");

  const approval = event.facultyApprovals.find(a => a.faculty.toString() === req.user._id.toString());
  if (!approval) return res.status(403).send("You are not assigned to this event");

  approval.read = true;
  approval.approved = null;
  approval.comment = comment;
  approval.respondedAt = new Date();

  event.status = 'Partially Approved';
  event.suggestedEdits = comment;

  await event.save();

  const student = await User.findById(event.coordinator);
  await sendMail(student.email, `Suggested edits for "${event.title}"`, comment);

  res.send("Edit suggestion submitted");
});

// 🔹 Faculty: View pending events
router.get('/pending', authMiddleware, requireRole('faculty'), async (req, res) => {
  const events = await EventRequest.find({
    'facultyApprovals.faculty': req.user._id
  }).populate('coordinator', 'name email');

  res.json(events);
});

// 🔹 Student Coordinator: Make event public
router.put('/:eventId/make-public', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  const { eventId } = req.params;
  const { registrationLinks } = req.body;

  const event = await EventRequest.findById(eventId);
  if (!event) return res.status(404).send("Event not found");

  if (event.coordinator.toString() !== req.user._id.toString()) {
    return res.status(403).send("Only the coordinator can modify this event");
  }

  event.isPublic = true;
  event.registrationLinks = registrationLinks || [];
  await event.save();

  res.json({ message: "Event marked as public with registration links", event });
});

// 🔹 Public: Get all public events
router.get('/public', async (req, res) => {
  const events = await EventRequest.find({ isPublic: true })
    .select('title clubName eventDate registrationLinks')
    .sort({ eventDate: 1 });

  res.json(events);
});

module.exports = router;
