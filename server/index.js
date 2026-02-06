const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const productRoute = require('./routes/products');
const orderRoute = require('./routes/orders');
const analyticsRoute = require('./routes/analytics');
const predictRoute = require('./routes/predict');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/predict', predictRoute);

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
