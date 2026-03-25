import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs'
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'
import prisma from '../prisma/client.js'
import logger from '../utils/logger.js'

const sqs = new SQSClient({ region: process.env.AWS_REGION })
const ses = new SESClient({ region: process.env.AWS_REGION })

// add deque for local retry management
class Deque {
    constructor() {
        this.items = []
    }

    // add to front — high priority (failed jobs)
    pushFront(item) {
        this.items.unshift(item)
    }

    // add to back — normal priority (new jobs)
    pushBack(item) {
        this.items.push(item)
    }

    // remove from front — always process front first
    popFront() {
        return this.items.shift()
    }

    popBack() {
        return this.items.pop()
    }

    isEmpty() {
        return this.items.length === 0
    }

    size() {
        return this.items.length
    }
}

const retryDeque = new Deque()  // in-memory retry queue for failed jobs
const MAX_RETRIES = 3

// generate CSV string from transactions
const generateCSV = (transactions) => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount']
    const rows = transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('en-IN'),
        `"${t.description}"`,   // wrap in quotes — descriptions may contain commas
        t.type.name,
        t.category.name,
        t.amount
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// build raw MIME email with CSV attachment
const sendCSVEmail = async (email, csv) => {
    const filename = `budgetwise_${new Date().toISOString().slice(0, 10)}.csv`
    const boundary = 'budgetwise_boundary'
    const csvBase64 = Buffer.from(csv).toString('base64')

    const rawEmail = [
        `From: ${process.env.EMAIL_USER}`,
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
        `This export was generated on ${new Date().toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric'
        })}.`,
        ``,
        `— BudgetWise`,
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

// fetch transactions from DB applying filters from job
const fetchTransactions = async (userId, filters = {}) => {
    const { typeFilter, categoryFilter, dateFilter, customStartDate, customEndDate } = filters

    const where = {
        user_id: userId,
        status: 1,
    }

    // type filter
    if (typeFilter && typeFilter !== 'all') {
        where.type = { name: typeFilter }
    }

    // category filter
    if (categoryFilter && categoryFilter !== 'all') {
        where.category = { name: categoryFilter }
    }

    // date filter
    if (dateFilter && dateFilter !== 'all') {
        const now = new Date()

        if (dateFilter === 'today') {
            const start = new Date(now.setHours(0, 0, 0, 0))
            const end = new Date(now.setHours(23, 59, 59, 999))
            where.createdAt = { gte: start, lte: end }

        } else if (dateFilter === 'week') {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            where.createdAt = { gte: weekAgo }

        } else if (dateFilter === 'month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1)
            where.createdAt = { gte: start }

        } else if (dateFilter === 'year') {
            const start = new Date(now.getFullYear(), 0, 1)
            where.createdAt = { gte: start }

        } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate)
            const end = new Date(customEndDate)
            end.setHours(23, 59, 59, 999)
            where.createdAt = { gte: start, lte: end }
        }
    }

    return prisma.transactions.findMany({
        where,
        include: { type: true, category: true },
        orderBy: { createdAt: 'desc' }
    })
}

// process a single job from the queue
const processJob = async (message, attemptNumber = 1) => {
    const { userId, email, filters } = JSON.parse(message.Body)

    logger.info({ message: 'Processing export job', userId, email, attempt: attemptNumber })

    const transactions = await fetchTransactions(userId, filters)

    if (transactions.length === 0) {
        // still send email — let user know nothing matched
        await sendCSVEmail(email, 'No transactions found for the selected filters.')
        logger.info({ message: 'Export sent — no transactions matched filters', userId })
        return
    }

    const csv = generateCSV(transactions)
    await sendCSVEmail(email, csv)

    logger.info({
        message: 'Export email sent',
        userId,
        email,
        transactionCount: transactions.length
    })
}

const isPermanentError = (err) => {
    const permanentErrors = [
        'Email address is not verified',
        'Missing final',
        'Invalid email',
        'MessageRejected'
    ]
    return permanentErrors.some(e => err.message.includes(e))
}

// poll SQS continuously
const poll = async () => {
    while (true) {
        try {
            // process retry deque first (priority)
            while (!retryDeque.isEmpty()) {
                const { message, attempts } = retryDeque.popFront()
                const job = JSON.parse(message.Body)
                try {
                    await processJob(message, attempts)
                    // success — delete from SQS
                    await sqs.send(new DeleteMessageCommand({
                        QueueUrl: process.env.SQS_QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle
                    }))

                    logger.info({
                        message: 'Export job succeeded after retry',
                        userId: job.userId,
                        attempt: attempts
                    })
                } catch (err) {
                    if (attempts >= MAX_RETRIES || isPermanentError(err)) {
                        logger.error({
                            message: isPermanentError(err)
                                ? 'Export job failed — permanent error, not retrying'
                                : 'Export job failed permanently — max retries exhausted',
                            userId: job.userId,
                            email: job.email,
                            error: err.message
                        })
                        // delete from SQS — no point retrying
                        await sqs.send(new DeleteMessageCommand({
                            QueueUrl: process.env.SQS_QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle
                        }))
                    } else {
                        retryDeque.pushBack({ message, attempts: attempts + 1 })  // re-queue at back for next retry round
                    }
                }
            }

            // poll SQS for new jobs
            const response = await sqs.send(new ReceiveMessageCommand({
                QueueUrl: process.env.SQS_QUEUE_URL,
                MaxNumberOfMessages: 5,
                WaitTimeSeconds: retryDeque.isEmpty() ? 10 : 3,  // long polling — waits up to 10s for messages
                // ↑ don't long poll if deque has items waiting
                AttributeNames: ['ApproximateReceiveCount']
            }))

            const messages = response.Messages || []

            for (const message of messages) {
                try {
                    await processJob(message, 1)

                    // delete from queue only after successful processing
                    await sqs.send(new DeleteMessageCommand({
                        QueueUrl: process.env.SQS_QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle
                    }))

                } catch (err) {
                    // first attempt failed — push to FRONT of deque for immediate retry
                    const job = JSON.parse(message.Body)
                    retryDeque.pushFront({ message, attempts: 2 })
                    logger.warn({
                        message: isPermanentError(err)
                            ? 'Export job failed — permanent error, not retrying'
                            : 'Export job failed permanently — max retries exhausted',
                        userId: job.userId,
                        error: err.message,
                        attempt: 1, url: message.Body
                    })
                }
            }
        } catch (err) {
            logger.error({ message: 'SQS poll error', error: err.message, url: err.url })
            await new Promise(r => setTimeout(r, 5000))  // wait 5s before retrying on error
        }
    }
}

// start worker (called from server.js)
export const startExportWorker = () => {
    logger.info({ message: 'Export worker started' })
    poll()  // non-blocking — starts async loop in background
}