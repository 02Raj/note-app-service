//<---------------- Global-Handle.js------------------------>
// /middlewares/error.middleware.js

const errorMiddleware = (err, req, res, next) => {
    // Log the error stack for debugging in the console
    console.error(err.stack);
  
    // If the error has a specific status code, use it. Otherwise, default to 500 (Internal Server Error).
    const statusCode = err.statusCode || 500;
  
    // If the error has a specific message, use it. Otherwise, use a generic server error message.
    const message = err.message || "An unexpected error occurred on the server.";
  
    // Send a standardized JSON error response
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: message,
    });
  };
  
  module.exports = errorMiddleware;