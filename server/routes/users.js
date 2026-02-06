const router = require('express').Router();
const User = require('../models/User');

// Get User Addresses
router.get('/:id/addresses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        // Add artificial ID for frontend key compatibility if needed, but Mongoose subdocs have _id by default
        res.status(200).json(user.addresses);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add Address
router.post('/:id/addresses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.addresses.push(req.body);
        await user.save();
        
        res.status(200).json(user.addresses);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
