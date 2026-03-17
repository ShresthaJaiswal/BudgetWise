import express from 'express'
import prisma from '../prisma/client.js'
import { protect } from '../middleware/authMiddleware.js'
import logger from '../utils/logger.js'

const router = express.Router()

// get all groups
router.get('/', protect, async (req, res) => {
    try {
        const groups = await prisma.group.findMany({
            where: {
                user_id: req.user.userId,
                status: 1
            },
            include: {
                transactions: {
                    include: {
                        transaction: {
                            include: { type: true, category: true }
                        }
                    }
                },
                _count: { select: { transactions: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        // compute net amount for each group
        const withNet = groups.map(g => {
            const net = g.transactions.reduce((sum, gt) => {
                const t = gt.transaction
                return t.type.name === 'income' ? sum + t.amount : sum - t.amount
            }, 0)
            return { ...g, net }
        })

        res.json(withNet)
    } catch (err) {
        logger.error({ message: 'Failed to fetch groups', error: err.message, userId: req.user.id, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

// create new group
router.post('/', protect, async (req, res) => {
    try {
        const { name } = req.body
        if (!name?.trim()) return res.status(400).json({ message: 'Group name is required' })

        const newGroup = await prisma.group.create({
            data: {
                name: name.trim(),
                user_id: req.user.userId,
                createdBy: req.user.userId,
                updatedBy: req.user.userId
            },
            include: { _count: { select: { transactions: true } } }
        })

        logger.info({ message: 'New Group created', groupId: newGroup.id, userId: req.user.id, url: req.originalUrl })
        res.status(201).json({ ...newGroup, net: 0 })
    } catch (err) {
        logger.error({ message: 'Failed to create group', error: err.message, userId: req.user?.userId, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

// rename group
router.patch('/:id', protect, async (req, res) => {
    try {
        const { name } = req.body
        if (!name?.trim()) return res.status(400).json({ message: 'Group name is required' })

        const updatedGroup = await prisma.group.update({
            where: { id: Number(req.params.id), user_id: req.user.id },
            data: { name: name.trim() },
        })

        logger.info({ message: 'Group renamed', groupId: req.params.id, userId: req.user.id, url: req.originalUrl })
        res.json(updatedGroup)
    } catch (err) {
        logger.error({ message: 'Failed to rename group', error: err.message, userId: req.user?.userId, groupId: req.params.id, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

// add transaction to group
router.post('/:id/transactions', protect, async (req, res) => {
    try {
        const { transaction_id } = req.body

        await prisma.group_transaction.create({
            data: {
                group_id: Number(req.params.id),
                transaction_id: Number(transaction_id),
                createdBy: req.user.userId
            }
        })

        logger.info({ message: 'Transaction added to group', groupId: req.params.id, transactionId: transaction_id, userId: req.user.id, url: req.originalUrl })
        res.status(201).json({ message: 'Transaction added to group' })
    } catch (err) {
        if (err.code === 'P2002') {  // Prisma unique constraint error code
            return res.status(409).json({ message: 'Transaction already in this group' })
        }
        logger.error({ message: 'Failed to add transaction to group', error: err.message, userId: req.user?.userId, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

// remove transaction from group
router.delete('/:id/transactions/:txnId', protect, async (req, res) => {
    try {
        await prisma.group_transaction.deleteMany({
            where: {
                group_id: Number(req.params.id),
                transaction_id: Number(req.params.txnId) // txnId comes from the URL path, not the body
            }
        })

        logger.info({ message: 'Transaction removed from group', groupId: req.params.id, transactionId: req.params.txnId, userId: req.user.id, url: req.originalUrl })
        res.json({ message: 'Transaction removed from group' })
    } catch (err) {
        logger.error({ message: 'Failed to remove transaction from group', error: err.message, userId: req.user?.userId, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

// delete group
router.delete('/:id', protect, async (req, res) => {
    try {

        // fetch before soft delete
        const existing = await prisma.group.findUnique({
            where: {
                id: Number(req.params.id),
                user_id: req.user.userId
            }
        })

        if (!existing) {
            return res.status(404).json({ message: 'Group not found' })
        }

        await prisma.group.update({
            where: {
                id: Number(req.params.id),
                user_id: req.user.userId
                // updatedAt: new Date()
                // In the where clause, updatedAt is not a unique identifier, it shouldn't be in where. It belongs in data if you want to track it, but since it's @updatedAt Prisma updates it automatically anyway
            },
            data: {
                status: 0  // soft delete
            }
        })

        logger.info({ message: 'Group deleted', groupId: req.params.id, userId: req.user.userId, url: req.originalUrl })
        res.json({ message: 'Group deleted' })
    } catch (err) {
        logger.error({ message: 'Failed to delete group', error: err.message, userId: req.user?.userId, groupId: req.params.id, url: req.originalUrl })
        res.status(500).json({ message: 'Server error' })
    }
})

export default router