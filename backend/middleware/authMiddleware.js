import jwt from 'jsonwebtoken'

export function protect(req, res, next) {
    try{
        // deriving token from auth request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, access denied' });
        }

        // extracting just the token removing "Bearer "
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        // now any user using this middleware can access the attached user info with the request
        req.user = decoded;

        // called to move on to the actual router handler
        next();

    } catch (err) {
        res.status(401).json({ message: 'Token invalid or expired' })
    }
}


// WORKING OF NEXT():

// Request comes in ->
// authMiddleware runs -> token invalid? -> return 401, stop here
//                              | (if valid)
//                              v
//                       next() is called -> Actual route handler runs ->
// Response sent