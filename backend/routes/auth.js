import express from 'express';
const router = express.Router();
import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// routes for register and login
// POST /api/auth/register

router.post('/register', async(req, res)=>{
    try{
        const {name, email, password} = req.body;

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
        const {email, password} = req.body;

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
            user: { id: existingUser.id, name: existingUser.name },
            message: 'User logged in successfully' 
        });

    } catch(err){
        res.status(500).json({ message: 'Server Error', error: err.message});
    }
})

export default router;