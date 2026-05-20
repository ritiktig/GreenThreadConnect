/**
 * Custom NoSQL Injection Protection Middleware for Express 5 compatibility.
 * Recursively removes keys starting with '$' or containing '.' from request body, params, and query.
 */
function sanitizeObject(obj) {
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object') {
                    sanitizeObject(obj[key]);
                }
            }
        }
    }
}

const mongoSanitizeMiddleware = (options = {}) => {
    return (req, res, next) => {
        if (req.body) {
            sanitizeObject(req.body);
        }
        if (req.params) {
            sanitizeObject(req.params);
        }
        if (req.query) {
            // Express 5 query is a getter, so we clone, sanitize, and redefine it
            try {
                const sanitizedQuery = JSON.parse(JSON.stringify(req.query));
                sanitizeObject(sanitizedQuery);
                Object.defineProperty(req, 'query', {
                    value: sanitizedQuery,
                    writable: true,
                    configurable: true
                });
            } catch (e) {
                console.error('Failed to sanitize query:', e);
            }
        }
        next();
    };
};

module.exports = mongoSanitizeMiddleware;
