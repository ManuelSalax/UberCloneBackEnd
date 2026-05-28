const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validationMiddleware");
const { profileUpdateValidator } = require("../utils/validators");

const {
  getProfile,
  updateProfile
} = require("../controllers/userController");

// ======================
// USER ROUTES
// ======================

// Get profile
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// Update profile
router.put(
  "/profile",
  authMiddleware,
  profileUpdateValidator,
  validateRequest,
  updateProfile
);

module.exports = router;