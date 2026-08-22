const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    const statusCode = err.statusCode || err.status || 500
    const message = err.message || 'Internal server error'

    console.error('[Unhandled Error]', {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        message,
        stack: err.stack,
    })

    if (typeof res.sendStructuredResponse === 'function') {
        return res.sendStructuredResponse(statusCode, null, message)
    }

    return res.status(statusCode).json({
        success: false,
        payload: null,
        message,
    })
}

export default errorMiddleware