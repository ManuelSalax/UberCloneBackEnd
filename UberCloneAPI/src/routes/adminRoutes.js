const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
  getAdminUsers,
  getAdminTrips,
  getAdminPayments,
} = require("../controllers/adminController");

// Restrict all routes in this file to ADMIN role
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));

// GET /api/admin/users - Retrieve all users
router.get("/users", getAdminUsers);

// GET /api/admin/trips - Retrieve all trips
router.get("/trips", getAdminTrips);

// GET /api/admin/payments - Retrieve all payments
router.get("/payments", getAdminPayments);

module.exports = router;
