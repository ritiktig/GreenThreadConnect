const router = require('express').Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get User Addresses
router.get('/:id/addresses', authenticateToken, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access: user ID mismatch" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user.addresses);
    } catch (err) {
        console.error('Error fetching addresses:', err);
        res.status(500).json({ message: "Failed to fetch addresses" });
    }
});

// Add Address
router.post('/:id/addresses', authenticateToken, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access: user ID mismatch" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.addresses.push(req.body);
        await user.save();
        
        res.status(200).json(user.addresses);
    } catch (err) {
        console.error('Error adding address:', err);
        res.status(500).json({ message: "Failed to add address" });
    }
});

module.exports = router;
