import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();

// ✅ Use CORS correctly (only once and globally)
const corsOptions = {
  origin: ['http://localhost:3001', 'https://3-space.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // cache preflight for 10 minutes
};

app.use(cors(corsOptions));

// ❌ Remove this (duplicate preflight handler)
// app.options('*', cors()); ❌

// ✅ Use express.json() to parse JSON body
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ✅ Contact form route
app.use('/api/contact', contactRoutes);

// ✅ Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
