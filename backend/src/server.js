const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { clerkMiddleware } = require('@clerk/express');

dotenv.config();

const app = express();

// Middleware
const defaultAllowed = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
const envAllowed = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
const allowedOrigins = Array.from(new Set([...envAllowed, ...defaultAllowed]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., curl/postman) with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Clerk middleware (optional - can be used for protected routes)
// app.use(clerkMiddleware());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

