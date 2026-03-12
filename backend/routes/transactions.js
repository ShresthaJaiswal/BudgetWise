import express from 'express'
const router = express.Router();
import prisma from '../prisma/client.js';
import { protect } from "../middleware/authMiddleware.js";
import logger from '../utils/logger.js'

// fetch all transactions for a user
router.get('/', protect, async (req, res) => {
    try {
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

    } catch (err) {
        logger.error({ message: 'Failed to fetch transactions', error: err.message, userId: req.user?.userId, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

// create new transaction
router.post('/', protect, async (req, res) => {
    try {
        const { type_id, description, amount, category_id, force } = req.body

        // ── duplicate check — same type+category+amount+desc within 24hrs ────
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // skip duplicate check if user confirmed they want to add anyway
        if (!force) {
            const duplicate = await prisma.transactions.findFirst({
                where: {
                    user_id: req.user.userId,
                    type_id,
                    category_id,
                    amount,
                    description: {
                        equals: description,
                        mode: 'insensitive'  // case-insensitive match
                    },
                    createdAt: { gte: since },
                    status: 1
                }
            })

            if (duplicate) {
                logger.warn({
                    message: 'Duplicate transaction blocked',
                    userId: req.user.userId,
                    duplicateOf: duplicate.id,
                    data: { type_id, description, amount, category_id }
                })
                return res.status(409).json({
                    message: 'A similar transaction was already logged within the last 24 hours. Are you sure you want to add it again?',
                    duplicate: true,
                    existingId: duplicate.id
                })
            }
        }

        // proceed with create
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

    } catch (err) {
        logger.error({ message: 'Failed to create transaction', error: err.message, userId: req.user?.userId, body: req.body, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

// edit a transaction
router.put('/:id', protect, async (req, res) => {
    try {
        const { type_id, description, amount, category_id } = req.body

        // fetch existing record BEFORE update
        const existing = await prisma.transactions.findUnique({
            where: {
                id: Number(req.params.id),
                user_id: req.user.userId
            },
            include: { type: true, category: true }
        })

        if (!existing) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        // perform update
        const updated = await prisma.transactions.update({
            where: {
                id: Number(req.params.id), // Find the transaction whose ID matches the one in the URL
                // We convert it to a number since URL params are strings and our Prisma schema has id Int
                // comes from '/:id'
                user_id: req.user.userId // Transaction must belong to the logged-in user
                // This value comes from 'protect'
            },
            data: {
                type_id, description, amount, category_id,
                updatedBy: req.user.userId // ← track who edited 
            },
            include: { type: true, category: true }
        })

        // audit log — before and after snapshot
        logger.info({
            message: 'Transaction updated',
            userId: req.user.userId,
            transactionId: existing.id,
            before: {
                description: existing.description,
                amount: existing.amount,
                type: existing.type.name,
                category: existing.category.name,
                updatedAt: existing.updatedAt
            },
            after: {
                description: updated.description,
                amount: updated.amount,
                type: updated.type.name,
                category: updated.category.name,
                updatedAt: updated.updatedAt
            }
        })

        res.json(updated)

    } catch (err) {
        logger.error({ message: 'Failed to update transaction', error: err.message, userId: req.user?.userId, transactionId: req.params.id, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

router.delete('/:id', protect, async (req, res) => {
    try {

        // fetch before soft delete
        const existing = await prisma.transactions.findUnique({
            where: {
                id: Number(req.params.id),
                user_id: req.user.userId
            },
            include: { type: true, category: true }
        })

        if (!existing) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        await prisma.transactions.update({
            where: {
                id: Number(req.params.id),
                user_id: req.user.userId
            },
            data: {
                status: 0  // soft delete
            }
        })

        // audit log
        logger.info({
            message: 'Transaction soft deleted',
            userId: req.user.userId,
            transactionId: existing.id,
            snapshot: {
                description: existing.description,
                amount: existing.amount,
                type: existing.type.name,
                category: existing.category.name,
                createdAt: existing.createdAt,
            }
        })

        res.json({ message: 'Transaction Deleted ' })

    } catch (err) {
        logger.error({ message: 'Failed to delete transaction', error: err.message, userId: req.user?.userId, transactionId: req.params.id, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

export default router;