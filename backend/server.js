require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');

const allowedOrigins = [
  'https://uni-verse-portal.vercel.app',
  'http://localhost:5173'
];

// ✅ Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// ✅ Handle preflight requests
app.options('*', cors());

app.use(express.json());

// MongoDB connection - ✅ Move this before routes
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Routes in logical order
app.get('/', (req, res) => res.send('Server running'));

// Auth routes first (most important)
app.use('/api/auth', require('./routes/auth'));

// User routes (includes online status)
app.use('/api/user', require('./routes/user'));

// Other routes
app.use('/api/events', require('./routes/events'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/studentcoordinator', require('./routes/studentCoordinator'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ideas', require('./routes/ideas'));
app.use('/api/showcase', require('./routes/showcase'));

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));