require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      return callback(new Error('CORS profile does not allow this origin'), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));
app.use(express.json());

// Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/production', require('./routes/production'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI || MONGO_URI.includes('your-cluster')) {
  console.error('\n❌ ERROR: Please set your MongoDB connection string in backend/.env');
  console.error('   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/sk_trading');
  console.error('\n📌 Free MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register\n');
  process.exit(1);
}

// Only listen when running locally
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 SK Trading Backend running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      console.error('\n📌 Make sure MongoDB is running (local) or your Atlas URI is correct in backend/.env\n');
    });
} else {
  // In production (Vercel), just connect to MongoDB
  mongoose.connect(MONGO_URI).catch(err => console.error('MongoDB connection error:', err));
}

module.exports = app;
