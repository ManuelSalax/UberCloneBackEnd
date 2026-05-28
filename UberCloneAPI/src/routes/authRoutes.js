const express = require("express");

const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");

const validateRequest = require("../middlewares/validationMiddleware");
const { registerValidator, loginValidator } = require("../utils/validators");

// ======================
// AUTH ROUTES
// ======================

// Register user
// POST /api/auth/register
router.post("/register", registerValidator, validateRequest, register);

// Login user
// POST /api/auth/login
router.post("/login", loginValidator, validateRequest, login);

module.exports = router;