import express from 'express'
const router = express.Router();
import prisma from '../prisma/client.js';
import { protect } from "../middleware/authMiddleware.js";
import logger from '../utils/logger.js'

// fetch all transactions for a user
router.get('/', protect, async(req, res)=> {
    try{
        console.log(req.user.userId)
        const transactions = await prisma.transactions.findMany({
            where: {
                user_id: req.user.userId,
                status: 1  // ← only fetch active, ignore soft deleted
             }, // userId references to the userId attribute defined in the token and user is the foreign key in transaction table
            include: {
                type: true,      // ← joins transaction_type table
                category: true,  // ← joins transaction_category table
            },
            orderBy: { createdAt: 'desc' }
        })
        res.json(transactions)

    } catch(err) {
        logger.error({ message: 'Failed to fetch transactions', error: err.message, userId: req.user?.userId })
        res.status(500).json({ message: 'Server error' })
    }
})

// create new transaction
router.post('/', protect, async(req, res)=> {
    try{
        const { type_id, description, amount , category_id} = req.body
        const newTransaction = await prisma.transactions.create({
            data: {
                type_id, description, amount, category_id,
                user_id: req.user.userId, // userId from token
                createdBy: req.user.userId, // track who created the transaction
                updatedBy: req.user.userId  // track who last updated the transaction
                // userId since the token identifies you, but the DB still needs to store who owns each transaction permanantly
            }
        })
        console.log(req.body)

        res.status(201).json(newTransaction)

    } catch(err) {
       logger.error({ message: 'Failed to create transaction', error: err.message, userId: req.user?.userId, body: req.body })
        res.status(500).json({ message: 'Server error' })
    }
})

// edit a transaction
router.put('/:id', protect, async(req, res)=> {
    try{
        const {type_id, description, amount, category_id } = req.body

        const transaction = await prisma.transactions.update({
            where: {
                id: Number(req.params.id), // Find the transaction whose ID matches the one in the URL
                // We convert it to a number since URL params are strings and our Prisma schema has id Int
                // comes from '/:id'
                user_id: req.user.userId // Transaction must belong to the logged-in user
                // This value comes from 'protect'
            },
            data: { type_id, description, amount, category_id, 
                updatedBy: req.user.userId // ← track who edited 
            },
            include: { type: true, category: true }
        })

        res.json(transaction)

    } catch(err) {
        logger.error({ message: 'Failed to update transaction', error: err.message, userId: req.user?.userId, transactionId: req.params.id })
        res.status(500).json({ message: 'Server error' })
    }
})

router.delete('/:id', protect, async(req, res)=> {
    try{
        await prisma.transactions.update({
            where: {
                id: Number(req.params.id),
                user_id: req.user.userId
            },
            data: {
                status: 0  // ← soft delete
            }
        })

        res.json({ message: 'Transaction Deleted '})

    } catch(err) {
        logger.error({ message: 'Failed to delete transaction', error: err.message, userId: req.user?.userId, transactionId: req.params.id })
        res.status(500).json({ message: 'Server error' })
    }
})

export default router;