import express from 'express';
const router = express.Router();
import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod'; // for validating incoming data

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  currency: z.string().optional().default('INR')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// routes for register and login
// POST /api/auth/register

router.post('/register', async(req, res)=>{
    try{
        // Validate first — before touching the database
        const result = registerSchema.safeParse(req.body)
        if (!result.success) {
        return res.status(400).json({ 
            message: result.error.errors[0].message 
        })
        }

        const { name, email, password, currency } = result.data

        const existingUser = await prisma.user.findUnique({
            where: {email},
        });

        if (existingUser){
            return res.status(400).json({ message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                currency
            },
        })

        // const token = jwt.sign(
        //     {userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'}
        // );

        res.status(201).json({ 
            // token,
            user: { id: user.id, name: user.name },
            message: 'User created successfully' 
        });

    } catch(err){
        res.status(500).json({ message: 'Server Error', error: err.message});
        // skip in Prod -> error: err.message
        // use for debugging
    }
})

router.post('/login', async(req, res)=>{
    try{
        const result = loginSchema.safeParse(req.body)
        if (!result.success) {
        return res.status(400).json({ 
            message: result.error.errors[0].message 
        })
        }

        const { email, password } = result.data

        const existingUser = await prisma.user.findUnique({
            where: {email},
        });

        if (!existingUser){
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch){
            return res.status(400).json({ message: 'Inavlid credentials' });
        }

        const token = jwt.sign(
            {userId: existingUser.id}, process.env.JWT_SECRET, {expiresIn: '7d'}
        );

        res.status(200).json({ 
            token,
            user: { id: existingUser.id, name: existingUser.name,  email: existingUser.email, currency: existingUser.currency },
            message: 'User logged in successfully' 
        });

    } catch(err){
        res.status(500).json({ message: 'Server Error', error: err.message});
    }
})

export default router;