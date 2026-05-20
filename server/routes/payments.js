const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Setup Razorpay using environment variables (Fallback dummy keys for safety if env not set)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_DUMMY',
    key_secret: process.env.RAZORPAY_SECRET_KEY || 'DUMMY_SECRET'
});

// Route: Create an Order
router.post('/order', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
    try {
        const { amount } = req.body; // Amount should be in smaller denomination if required, depending on UI format.
        // Razorpay expects amount in paise (multiply by 100 for INR)
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        console.error("Error creating razorpay order:", error);
        res.status(500).json({ message: "Failed to create payment order" });
    }
});

// Route: Verify Payment Signature
router.post('/verify', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY || 'DUMMY_SECRET')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified successfully
             return res.status(200).json({ message: "Payment verified successfully" });
        } else {
             return res.status(400).json({ message: "Invalid signature sent!" });
        }

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

module.exports = router;
