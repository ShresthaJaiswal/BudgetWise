import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 7,
    message: 'Too many authentication requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
})

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many password reset requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
})