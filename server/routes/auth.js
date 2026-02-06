const router = require('express').Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, region } = req.body;
        
        // Simple check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const newUser = new User({ name, email, password, role, region });
        const savedUser = await newUser.save();

        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // In a real app, verify hashed password here
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { password: _, ...others } = user._doc;
        
        // Return dummy token + user info
        res.status(200).json({ token: "mock-jwt-token-express", user: others });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
