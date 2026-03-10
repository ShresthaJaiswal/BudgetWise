import logger from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.userId || null,
        body: req.body,
        statusCode: err.statusCode || 500,
    })

    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal server error',
    })
}