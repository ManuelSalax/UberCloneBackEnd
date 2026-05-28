const express = require("express");

const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");

// ======================
// AUTH ROUTES
// ======================

// Register user
// POST /api/auth/register
router.post("/register", register);

// Login user
// POST /api/auth/login
router.post("/login", login);

module.exports = router;