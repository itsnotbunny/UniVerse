require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/student-coordinators', require('./routes/studentCoordinator'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ideas', require('./routes/ideas'));

app.get('/', (req, res) => res.send('Server running'));

module.exports = app; // ✅ Export for Vercel
