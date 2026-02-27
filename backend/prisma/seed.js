import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Seed is needed because the new tables are empty.

async function main() {
  await prisma.transaction_type.createMany({
    data: [
      { name: 'income' },
      { name: 'expense' },
    ],
    skipDuplicates: true,
  })

  await prisma.transaction_category.createMany({
    data: [
      { name: 'Food & Dining' },
      { name: 'Transport' },
      { name: 'Shopping' },
      { name: 'Entertainment' },
      { name: 'Healthcare' },
      { name: 'Utilities' },
      { name: 'Salary' },
      { name: 'Freelance' },
      { name: 'Investment' },
      { name: 'Refund' },
      { name: 'Other' },
    ],
    skipDuplicates: true,
  })
}

main()
  .then(() => { console.log('Seeded'); process.exit(0) })
  .catch(err => { console.error(err); process.exit(1) })