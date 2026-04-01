import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import lookupRoutes from './routes/lookup.js'
import passwordResetRoutes from './routes/passwordReset.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'
import quoteRoutes from './routes/quote.js'
import statsRoutes from './routes/stats.js'
import cookieParser from 'cookie-parser'
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js'
import groupRoutes from './routes/groups.js'
import exportRoutes from './routes/export.js'
import serverless from 'serverless-http'
// disable startExportWorker() cron for now, convert to a scheduled Lambda later

const app = express()
app.set('trust proxy', 1) // if behind a proxy (like API Gateway), trust the X-Forwarded-* headers

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser())

app.get('/api/health', (req, res)=> {
    res.json({ message: 'Server is running' })
})
app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api', lookupRoutes)
app.use('/api/auth', passwordResetRoutes)
app.use('/api', quoteRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/export', exportRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found'})
})

app.use(errorHandler)

// instead of routes like......
// app.get('/', (req, res) =>{
//     res.send('Backend is running 🚀')
// })
// we typically have handlers

// This is the Lambda handler — NO app.listen()
export const handler = serverless(app)