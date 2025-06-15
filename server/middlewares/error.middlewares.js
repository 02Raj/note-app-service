/**
 * A robust global error handling middleware.
 * This should be the LAST middleware registered in app.js.
 * It catches any errors that occur in the route handlers.
 */
const errorHandler = (err, req, res, next) => {
    // Log the full error to the terminal for debugging
    console.error('--- UNCAUGHT ERROR (GLOBAL HANDLER) ---');
    console.error(err.stack || err);
    console.error('------------------------------------');

    // Default to a 500 Internal Server Error if no status code is set
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Send a clean, standardized JSON response to the client
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'An unexpected error occurred on the server.',
        // In development mode, you might want to send the stack trace
        // stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler
};
