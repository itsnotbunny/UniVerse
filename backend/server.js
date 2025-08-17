// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ CORS setup
const allowedOrigins = [
  'https://uni-verse-portal.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Handle preflight globally

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Root route
app.get('/', (req, res) => res.send('Server running'));

// ✅ API Routes
console.log("loading api/auth");
app.use('/api/auth', require('./routes/auth'));

console.log("loading api/user");
app.use('/api/user', require('./routes/user'));

console.log("loading api/events");
app.use('/api/events', require('./routes/events'));

console.log("loading api/faculty");
app.use('/api/faculty', require('./routes/faculty'));

console.log("loading api/studentcoordinator");
app.use('/api/studentcoordinator', require('./routes/studentCoordinator'));

console.log("loading api/admin");
app.use('/api/admin', require('./routes/admin'));

console.log("loading api/ideas");
app.use('/api/ideas', require('./routes/ideas'));

console.log("loading api/showcase");
app.use('/api/showcase', require('./routes/showcase'));

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ✅ Catch-all 404 route
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
