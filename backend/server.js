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

const app = express()
// parse incoming JSON request bodies
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())

// Routes
app.get('/api/health', (req, res)=> {
    res.json({ message: 'Server is running' })
})
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api', lookupRoutes)
app.use('/api/auth', passwordResetRoutes)
app.use('/api', quoteRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)
app.use('/api/groups', groupRoutes)

// Allow frontend (5173) to talk to backend (5000)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found'})
})

app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000

app.get('/', (req, res) =>{
    res.send('Backend is running 🚀')
})

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})