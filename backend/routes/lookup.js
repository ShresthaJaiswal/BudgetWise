import express from 'express'
const router = express.Router();
import prisma from '../prisma/client.js';

// routes/lookup.js
router.get('/types', async (req, res) => {
  const types = await prisma.transaction_type.findMany()
  res.json(types)  // → [{ id: 1, name: 'income' }, { id: 2, name: 'expense' }]
})

router.get('/categories', async (req, res) => {
  const categories = await prisma.transaction_category.findMany()
  res.json(categories)
})

export default router