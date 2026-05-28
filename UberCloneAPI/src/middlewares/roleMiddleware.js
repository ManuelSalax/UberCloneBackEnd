const User = require("../models/User");

/**
 * Middleware to authorize access based on user roles.
 * Must be used AFTER authMiddleware.
 * @param {...string} roles The allowed roles for the route (e.g., 'PASSENGER', 'DRIVER', 'ADMIN')
 */
const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User credentials not found in request context. Verify authMiddleware is applied first.",
        });
      }

      let userRole = req.user.role;

      // Robust fallback if JWT does not contain the role yet
      if (!userRole) {
        const user = await User.findById(req.user.userId).select("role");
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found in system.",
          });
        }
        userRole = user.role;
        req.user.role = userRole; // Cache for subsequent requests in the lifecycle
      }

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access restricted. Requires one of the following roles: [${roles.join(", ")}]. Current role: '${userRole}'.`,
        });
      }

      next();
    } catch (error) {
      next(error); // Forward to global error handler
    }
  };
};

module.exports = authorizeRoles;
