const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Format: Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "Authentication token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_greenthread_12345_key');
        req.user = decoded; // Contains id and role
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Unauthorized access: permission denied" });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };
