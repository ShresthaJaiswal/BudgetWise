import express from 'express';
const router = express.Router();
import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod'; // for validating incoming data
import logger from '../utils/logger.js'

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )
    return { accessToken, refreshToken }
}

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Invalid email'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    currency: z.string().optional().default('INR')
})

const loginSchema = z.object({
    email: z.email('Invalid email address'), 
    password: z.string().min(1, 'Password is required'),
})

// routes for register and login
// POST /api/auth/register

router.post('/register', async (req, res) => {
    try {
        // Validate first — before touching the database
        const result = registerSchema.safeParse(req.body)
        if (!result.success) {
            const issues = result.error.issues || result.error.errors || []
            return res.status(400).json({
                message: issues[0]?.message || 'Validation failed'
            })
        }

        const { name, email, password, currency, phone } = result.data

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                currency,
                phone: phone || null
            },
        })

        // const token = jwt.sign(
        //     {userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'}
        // );

        logger.info({ message: 'User registered', email, userId: user.id, url: req.originalUrl })
        res.status(201).json({
            // token,
            user: { id: user.id, name: user.name },
            message: 'User created successfully'
        });

    } catch (err) {
        logger.error({ message: 'Auth error', error: err.message, url: req.originalUrl })
        res.status(500).json({ message: 'Server Error', error: err.message });
        // skip in Prod -> error: err.message
        // use for debugging
    }
})

router.post('/login', async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body)
        if (!result.success) {
            const issues = result.error.issues || result.error.errors || []
            return res.status(400).json({
                message: issues[0]?.message || 'Validation failed'
            })
        }

        const { email, password } = result.data

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!existingUser) {
            logger.warn({ message: 'Failed login attempt', email, url: req.originalUrl })
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // const token = jwt.sign(
        //     { userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' }
        // );

        const { accessToken, refreshToken } = generateTokens(existingUser.id)
        // refresh token goes in httpOnly cookie — JS can't read it
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // https only in prod
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
        })

        logger.info({ message: 'User logged in', email, userId: existingUser.id, url: req.originalUrl })
        res.status(200).json({
            accessToken,
            user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, currency: existingUser.currency },
            message: 'User logged in successfully'
        });

    } catch (err) {
        logger.error({ message: 'Auth error', error: err.message, url: req.originalUrl })
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
})

// called automatically when access token expires
router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies.refreshToken
        if (!token) {
            return res.status(401).json({ message: 'No refresh token provided' })
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        const { accessToken } = generateTokens(decoded.userId)

        res.status(200).json({ accessToken });

    } catch (err) {
        logger.error({ message: 'Auth error', error: err.message, url: req.originalUrl })
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
})

// logout route to clear refresh token cookie
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;