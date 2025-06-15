/**
 * Sends a standardized success response.
 * @param {object} res - The Express response object.
 * @param {any} data - The data payload to send.
 * @param {string} message - A success message.
 * @param {number} statusCode - HTTP status code (default: 200).
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Sends a standardized error response and logs the full error stack.
 * This version is more robust to prevent '[object Object]' errors.
 * @param {object} res - The Express response object.
 * @param {Error|object|string} error - The error object or message.
 * @param {number} statusCode - HTTP status code (default: 500).
 */
const errorResponse = (res, error, statusCode = 500) => {
  // Log the full error stack to the terminal for better debugging.
  // The .stack property provides a detailed string trace.
  console.error('--- DETAILED SERVER ERROR ---');
  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(error);
  }
  console.error('-----------------------------');

  // Determine the message to send to the client.
  let message = 'An internal server error occurred.';
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Ensure headers are not already sent before trying to send a response.
  if (!res.headersSent) {
    return res.status(statusCode).json({
      status: 'error',
      message: message,
    });
  }
};

module.exports = {
  successResponse,
  errorResponse,
};
