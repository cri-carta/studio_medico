const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token      = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token mancante.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.utente    = decoded; // { id, email, role }
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token non valido o scaduto.' });
    }
}

module.exports = authMiddleware;