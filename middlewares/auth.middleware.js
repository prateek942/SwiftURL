import {validateUserToken} from '../utils/token.js';



/**
 * 
 * @param {import("express".Request)} req 
 * @param {import("express".Response)} res 
 * @param {import("express".NextFunction)} next 
 */

export function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization']; // see if the authorization header is present
    if(!authHeader) return next();

    if(!authHeader.startsWith('Bearer ')) return res.status(401).json({error: 'Authorization header must start with Bearer '}); 

    const [_, token] = authHeader.split(' '); // get the token from the header

    const payload = validateUserToken(token); // validate the token and get the payload

    req.user = payload; // attach the payload to the request object
    next(); // call the next middleware
}

export function ensureAthenticated(req, res, next) {
    if(!req.user || !req.user.id) return res.status(401).json({error: 'You must be logged in to perform this action'});
    next();
}