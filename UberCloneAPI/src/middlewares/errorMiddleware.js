/**
 * Centralized Error Handling Middleware for standardizing API error responses.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error("Centralized Error Handler caught an exception:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    statusCode: err.statusCode,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors,
  });
};

module.exports = errorMiddleware;
