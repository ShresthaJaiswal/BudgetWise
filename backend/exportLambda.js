import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'
import prisma from './prisma/client.js'
import logger from './utils/logger.js'

const ses = new SESClient({ region: process.env.AWS_REGION })

const generateCSV = (transactions) => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount']
    const rows = transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('en-IN'),
        `"${t.description}"`,
        t.type.name,
        t.category.name,
        t.amount
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const sendCSVEmail = async (email, csv) => {
    const filename = `budgetwise_${new Date().toISOString().slice(0, 10)}.csv`
    const boundary = 'budgetwise_boundary'
    const csvBase64 = Buffer.from(csv).toString('base64')

    const rawEmail = [
        `From: ${process.env.SES_FROM_EMAIL}`,
        `To: ${email}`,
        `Subject: Your BudgetWise Export`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        `Hi there,`,
        ``,
        `Your BudgetWise transaction export is ready. Please find the CSV file attached.`,
        ``,
        `-- BudgetWise`,
        ``,
        `--${boundary}`,
        `Content-Type: text/csv; name="${filename}"`,
        `Content-Disposition: attachment; filename="${filename}"`,
        `Content-Transfer-Encoding: base64`,
        ``,
        csvBase64,
        ``,
        `--${boundary}--`
    ].join('\r\n')

    await ses.send(new SendRawEmailCommand({
        RawMessage: { Data: Buffer.from(rawEmail) }
    }))
}

const fetchTransactions = async (userId, filters = {}) => {
    const { typeFilter, categoryFilter, dateFilter, customStartDate, customEndDate } = filters
    const where = { user_id: userId, status: 1 }

    if (typeFilter && typeFilter !== 'all') {
        where.type = { name: typeFilter }
    }
    if (categoryFilter && categoryFilter !== 'all') {
        where.category = { name: categoryFilter }
    }
    if (dateFilter && dateFilter !== 'all') {
        const now = new Date()
        if (dateFilter === 'today') {
            where.createdAt = { gte: new Date(now.setHours(0,0,0,0)), lte: new Date(now.setHours(23,59,59,999)) }
        } else if (dateFilter === 'week') {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            where.createdAt = { gte: weekAgo }
        } else if (dateFilter === 'month') {
            where.createdAt = { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
        } else if (dateFilter === 'year') {
            where.createdAt = { gte: new Date(now.getFullYear(), 0, 1) }
        } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
            const end = new Date(customEndDate)
            end.setHours(23, 59, 59, 999)
            where.createdAt = { gte: new Date(customStartDate), lte: end }
        }
    }

    return prisma.transactions.findMany({
        where,
        include: { type: true, category: true },
        orderBy: { createdAt: 'desc' }
    })
}

// AWS triggers automatically when a message appears in SQS
export const handler = async (event) => {
    for (const record of event.Records) {
        const { userId, email, filters } = JSON.parse(record.body)
        
        logger.info({ message: 'Processing export job', userId, email })

        const transactions = await fetchTransactions(userId, filters)
        const csv = transactions.length > 0
            ? generateCSV(transactions)
            : 'No transactions found for the selected filters.'

        await sendCSVEmail(email, csv)

        logger.info({ message: 'Export email sent', userId, email, count: transactions.length })
        // No SQS delete needed, AWS handles it automatically on success
    }
}