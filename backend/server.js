require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); // ✅ Render will now detect it

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/student-coordinators', require('./routes/studentCoordinator'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ideas', require('./routes/ideas'));

app.get('/', (req, res) => res.send('Server running'));

// ❌ Remove this: module.exports = app;
