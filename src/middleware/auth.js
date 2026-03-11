const User = require('../models/user');
const jwt = require('jsonwebtoken');


exports.authenticate = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(400).json({
                message: 'token not found'
            })
        }
        const token = auth.split(' ')[1]
        if (!token) {
            return res.status(404).json({
                message: 'Invalid Token'
            })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken.userId)

        if (!user) {
            return res.status(400).json({
                message: 'Authentication failed : user not found'
            })
        }
        if (user.isLoggedIn !== decodedToken.isLoggedIn) {
            return res.status(401).json({
                message: 'Unathorized: you must be logged in to perform this action'
            })
        }
        req.user = decodedToken
        await user.save()

        next()
    } catch (error) {
        console.log(error.message);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                message: 'Session timeout : Please Login To Continue'
            })
        }
        res.status(500).json({
            message: 'internal server error'
        })
    }
}


exports.apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }

    try {
        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        if (!user.allowedIPs.includes(req.ip) && req.ip !== '127.0.0.1' && req.ip !== '::1') {
            return res.status(403).json({ error: 'IP not allowed' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ error: 'Session timeout : Please Login To Continue' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

