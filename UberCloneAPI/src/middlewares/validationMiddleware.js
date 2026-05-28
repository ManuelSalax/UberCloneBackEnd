const { validationResult } = require("express-validator");

/**
 * Express Middleware that intercepts incoming request validations and checks if any rules failed.
 * Returns standard 400 Bad Request with all validation error details formatted.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Standardized response format as requested by user
    return res.status(400).json({
      success: false,
      message: "Validation failed on input payload",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
        location: err.location,
      })),
    });
  }

  next();
};

module.exports = validateRequest;
