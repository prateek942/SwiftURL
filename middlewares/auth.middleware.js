import {validateUserToken} from '../utils/token.js';

export function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if(!authHeader) return next();

    if(!authHeader.startsWith('Bearer ')) return res.status(401).json({error: 'Authorization header must start with Bearer '});

    const [_, token] = authHeader.split(' ');
    const payload = validateUserToken(token);

    req.user = payload;
    next();
}

export function ensureAthenticated(req, res, next) {
    if(!req.user || !req.user.id) return res.status(401).json({error: 'You must be logged in to perform this action'});
    next();
}