// Check for problematic routes (run this temporarily to debug)
// Add this to the top of your server.js temporarily, then remove it

const originalUse = require('express').Router.prototype.use;
const originalGet = require('express').Router.prototype.get;
const originalPost = require('express').Router.prototype.post;
const originalPut = require('express').Router.prototype.put;
const originalDelete = require('express').Router.prototype.delete;

function logRoute(method, path) {
  console.log(`📍 Registering ${method} route: ${path}`);
  
  // Check for problematic patterns
  if (typeof path === 'string') {
    if (path.includes('::') || path.match(/:[^a-zA-Z_]/)) {
      console.warn(`⚠️  Potentially problematic route pattern: ${path}`);
    }
  }
}

require('express').Router.prototype.use = function(...args) {
  if (typeof args[0] === 'string') logRoute('USE', args[0]);
  return originalUse.apply(this, args);
};

require('express').Router.prototype.get = function(...args) {
  if (typeof args[0] === 'string') logRoute('GET', args[0]);
  return originalGet.apply(this, args);
};

require('express').Router.prototype.post = function(...args) {
  if (typeof args[0] === 'string') logRoute('POST', args[0]);
  return originalPost.apply(this, args);
};

require('express').Router.prototype.put = function(...args) {
  if (typeof args[0] === 'string') logRoute('PUT', args[0]);
  return originalPut.apply(this, args);
};

require('express').Router.prototype.delete = function(...args) {
  if (typeof args[0] === 'string') logRoute('DELETE', args[0]);
  return originalDelete.apply(this, args);
};


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');

const allowedOrigins = [
  'https://uni-verse-portal.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// ✅ Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman, extensions)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log the blocked origin for debugging
      console.log('❌ CORS blocked origin:', origin);
      callback(null, true); // Temporarily allow all origins to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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