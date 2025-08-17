// backend/routes/events.js
const express = require('express');
const router = express.Router();
const sendMail = require('../utils/mailer');
const EventRequest = require('../models/EventRequest');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// 🔹 Student Coordinator: Submit new event (auto-assign all approved faculty)
router.post('/', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  try {
    console.log("📥 Body at route entry:", req.body, " | Headers:", req.headers);

    const { title, description, eventDate, registrationLinks } = req.body;
    if (!title || !description || !eventDate) {
      return res.status(400).json({ message: "Missing or invalid fields in request" });
    }

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // 🔸 Find all approved faculty and create approval slots for each
    const faculties = await User.find({ role: 'faculty', isApproved: true }).select('_id name email');
    const facultyApprovals = faculties.map(f => ({
      faculty: f._id,
      read: false,
      approved: null,
      comment: '',
      respondedAt: null
    }));

    const newEvent = new EventRequest({
      title,
      description,
      eventDate: parsedDate,
      clubName: req.user.clubName || '',
      registrationLinks: Array.isArray(registrationLinks) ? registrationLinks : [],
      coordinator: req.user._id,
      facultyApprovals,
      isPublic: false,
      status: 'Pending'
    });

    await newEvent.save();

    console.log(`✅ Event "${title}" submitted by ${req.user.name} and assigned to ${faculties.length} faculty`);

    // (optional) notify faculty by email here using sendMail…

    // Return with populated faculty for nicer UI
    const populated = await EventRequest.findById(newEvent._id)
      .populate('facultyApprovals.faculty', 'name email')
      .populate('coordinator', 'name email');

    return res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Error creating event:", err);
    return res.status(500).json({ message: "Server error while creating event" });
  }
});

// 🔹 Student Coordinator: Fetch own events (populate for display)
router.get('/sent', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  try {
    const events = await EventRequest.find({ coordinator: req.user._id })
      .sort({ createdAt: -1 })
      .populate('facultyApprovals.faculty', 'name email')
      .lean();

    return res.json(events);
  } catch (err) {
    console.error('❌ Fetch /sent error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Student Coordinator: Update organisation flow
router.put('/:eventId/organisation', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  try {
    const { organisingFlow } = req.body;
    const { eventId } = req.params;

    const event = await EventRequest.findById(eventId);
    if (!event) return res.status(404).send("Event not found");
    if (event.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).send("Not authorized to edit this event");
    }

    event.organisingFlow = organisingFlow || '';
    await event.save();
    res.send("Organising flow updated");
  } catch (err) {
    console.error('❌ Update org flow error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Faculty: Approve/reject event
router.put('/:eventId/respond', authMiddleware, requireRole('faculty'), async (req, res) => {
  try {
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
    approval.comment = comment || '';
    approval.respondedAt = new Date();

    // Optionally: update event.status when all responded
    const allApproved = event.facultyApprovals.length > 0 &&
      event.facultyApprovals.every(a => a.approved === true);
    const anyRejected = event.facultyApprovals.some(a => a.approved === false);
    const anyPending = event.facultyApprovals.some(a => a.approved === null);

    if (allApproved) event.status = 'Approved';
    else if (anyRejected) event.status = 'Rejected';
    else if (!anyPending) event.status = 'Partially Approved'; // all responded, mixed
    else event.status = 'Pending';

    await event.save();
    res.send("Event decision recorded");
  } catch (err) {
    console.error('❌ Faculty respond error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Faculty: Suggest edits
router.put('/:eventId/suggest-edits', authMiddleware, requireRole('faculty'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { comment } = req.body;

    const event = await EventRequest.findById(eventId);
    if (!event) return res.status(404).send("Event not found");

    const approval = event.facultyApprovals.find(a => a.faculty.toString() === req.user._id.toString());
    if (!approval) return res.status(403).send("You are not assigned to this event");

    approval.read = true;
    approval.approved = null;
    approval.comment = comment || '';
    approval.respondedAt = new Date();

    event.status = 'Partially Approved';
    event.suggestedEdits = comment || '';

    await event.save();

    const student = await User.findById(event.coordinator);
    if (student?.email && comment) {
      await sendMail(student.email, `Suggested edits for "${event.title}"`, comment);
    }

    res.send("Edit suggestion submitted");
  } catch (err) {
    console.error('❌ Suggest edits error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Faculty: View pending events (events assigned to this faculty)
router.get('/pending', authMiddleware, requireRole('faculty'), async (req, res) => {
  try {
    const events = await EventRequest.find({
      'facultyApprovals.faculty': req.user._id
    })
      .populate('coordinator', 'name email')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    console.error('❌ Faculty pending error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Student Coordinator: Make event public
router.put('/:eventId/make-public', authMiddleware, requireRole('studentCoordinator'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { registrationLinks } = req.body;

    const event = await EventRequest.findById(eventId);
    if (!event) return res.status(404).send("Event not found");

    if (event.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).send("Only the coordinator can modify this event");
    }

    event.isPublic = true;
    event.registrationLinks = Array.isArray(registrationLinks) ? registrationLinks : [];
    await event.save();

    res.json({ message: "Event marked as public with registration links", event });
  } catch (err) {
    console.error('❌ Make public error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Public: Get all public events
router.get('/public', async (req, res) => {
  try {
    const events = await EventRequest.find({ isPublic: true })
      .select('title clubName eventDate registrationLinks')
      .sort({ eventDate: 1 });

    res.json(events);
  } catch (err) {
    console.error('❌ Public events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
