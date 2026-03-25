import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { enqueueExportJob } from '../utils/sqsClient.js'
import logger from '../utils/logger.js'
import prisma from '../prisma/client.js'

const router = express.Router()

router.post('/csv', protect, async (req, res) => {
    try {
        const { filters } = req.body

        // fetch email from DB since JWT only has userId
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { email: true }
        })

        if (!user) return res.status(404).json({ message: 'User not found' })

        await enqueueExportJob({
            userId: req.user.id,
            email: user.email,
            filters
        })

        logger.info({ message: 'Export job queued', userId: req.user.userId })
        res.status(200).json({ message: 'Export queued — you will receive an email shortly.' })
    } catch (error) {
        logger.error({ message: 'Failed to queue export', error: error.message })
        res.status(500).json({ message: 'Failed to enqueue export job' })
    }
})

export default router