const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

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
  updateProfile
);

module.exports = router;