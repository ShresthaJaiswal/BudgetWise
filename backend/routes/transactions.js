import express from 'express'
const router = express.Router();
import prisma from '../prisma/client.js';
import { protect } from "../middleware/authMiddleware.js";

// fetch all transactions for a user
router.get('/', protect, async(req, res)=> {
    try{
        // console.log(req.user.userId)
        const transactions = await prisma.transaction.findMany({
            where: {userId: req.user.userId }, // userId references to the userId attribute defined in the token and user is the foreign key in transaction table
            orderBy: { createdAt: 'desc' }
        })
        res.json(transactions)

    } catch(err) {
        console.error("TRANSACTION ERROR:", err);
        res.status(500).json({ message: 'Server error' })
    }
})

// create new transaction
router.post('/', protect, async(req, res)=> {
    try{
        const { type, description, amount, category} = req.body

        const newTransaction = await prisma.transaction.create({
            data: {
                type, description, amount, category, userId: req.user.userId
                // userId since the token identifies you, but the DB still needs to store who owns each transaction permanantly
            }
        })

        res.status(201).json(newTransaction)

    } catch(err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// edit a transaction
router.put('/:id', protect, async(req, res)=> {
    try{
        const {type, description, amount, category } = req.body

        const transaction = await prisma.transaction.update({
            where: {
                id: Number(req.params.id), // Find the transaction whose ID matches the one in the URL
                // We convert it to a number since URL params are strings and our Prisma schema has id Int
                // comes from '/:id'
                userId: req.user.userId // Transaction must belong to the logged-in user
                // This value comes from 'protect'
            },
            data: { type, description, amount, category }
        })

        res.json(transaction)

    } catch(err) {
        res.status(500).json({ message: 'Server error' })
    }
})

router.delete('/:id', protect, async(req, res)=> {
    try{
        await prisma.transaction.delete({
            where: {
                id: Number(req.params.id),
                userId: req.user.userId
            }
        })

        res.json({ message: 'Transaction Deleted '})

    } catch(err) {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router;