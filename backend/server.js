require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events');
const studentCoordinatorRoutes = require('./routes/studentCoordinator');
const adminRoutes = require('./routes/admin');
const ideaRoutes = require('./routes/ideas'); // ✅ Now safe to use

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student-coordinators', studentCoordinatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ideas', ideaRoutes); // ✅ Now after app is defined

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
