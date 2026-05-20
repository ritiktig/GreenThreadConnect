const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, region } = req.body;
        
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const normalizedEmail = email.toLowerCase();
        
        // Check if user exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            name, 
            email: normalizedEmail, 
            password: hashedPassword, 
            role, 
            region 
        });
        
        const savedUser = await newUser.save();

        // Exclude password from the response
        const { password: _, ...others } = savedUser._doc;
        if (others._id) others.id = others._id.toString();
        res.status(201).json(others);
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify password with legacy upgrade fallback support
        let isMatch = false;
        const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        
        if (isBcryptHash) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Legacy plaintext comparison
            isMatch = user.password === password;
            if (isMatch) {
                // Securely upgrade legacy plaintext password to bcrypt hash on successful login
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
                console.log(`[Security Upgrade] Migrated legacy password for user: ${normalizedEmail}`);
            }
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Sign actual JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_greenthread_12345_key',
            { expiresIn: '3d' }
        );

        const { password: _, ...others } = user._doc;
        if (others._id) others.id = others._id.toString();
        
        res.status(200).json({ token, user: others });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

module.exports = router;

