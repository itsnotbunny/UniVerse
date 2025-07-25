require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');

const allowedOrigins = [
  'https://uni-verse-portal.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); // ✅ Render will now detect it

const facultyRoutes = require('./routes/faculty');
app.use('/api/faculty', facultyRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/studentcoordinator', require('./routes/studentCoordinator'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ideas', require('./routes/ideas'));
app.use('/api/showcase', require('./routes/showcase'));
app.use('/api/user', require('./routes/user'));

app.get('/', (req, res) => res.send('Server running'));

// ❌ Remove this: module.exports = app;
