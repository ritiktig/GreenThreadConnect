const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('./middleware/mongoSanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const productRoute = require('./routes/products');
const orderRoute = require('./routes/orders');
const analyticsRoute = require('./routes/analytics');
const predictRoute = require('./routes/predict');
console.log("Loading AI Route...");
const aiRoute = require('./routes/ai');
const paymentsRoute = require('./routes/payments');
console.log("AI Route Loaded");

const app = express();

// --- Security Middleware ---
app.use(helmet()); // Protect against common web vulnerabilities by setting appropriate HTTP headers
app.use(mongoSanitize()); // Sanitize data to prevent NoSQL query injection attacks

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'http://localhost:3000', 
      'https://greenthread-connect.vercel.app', 
      'http://localhost:5173',
      'https://greenthreadconnect-app.onrender.com'
    ];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('CORS Policy block: Origin not allowed'), false);
    },
    credentials: true
}));

app.use(compression());
// Limit request payload to 10MB to protect server memory while supporting image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Rate Limiting ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, 
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 30, // Protect registration & login against brute force
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login/registration attempts, please try again after 15 minutes" }
});

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Protect Gemini API keys and pricing prediction resource usage
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many AI assistant requests, please try again after 15 minutes" }
});

// Apply rate limits to paths
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/predict', aiLimiter);

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/predict', predictRoute);
app.use('/api/ai', aiRoute);
app.use('/api/payments', paymentsRoute);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Green Thread Connect API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;

// Export for Vercel (serverless)
module.exports = app;

// Start Server only if not running in a serverless environment (detected by main module)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
