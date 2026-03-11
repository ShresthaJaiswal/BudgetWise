import express from 'express'
import prisma from '../prisma/client.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const [userCount, transactionCount, topCategory] = await Promise.all([
      prisma.user.count(),
      prisma.transactions.count({ where: { status: 1 } }),
      prisma.transactions.groupBy({
        by: ['category_id'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
        where: { status: 1 }
      })
    ])

    const category = topCategory[0]
      ? await prisma.transaction_category.findUnique({ where: { id: topCategory[0].category_id } })
      : null

    res.json({
      userCount,
      transactionCount,
      topCategory: category?.name || 'N/A'
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router