const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validationMiddleware");

const {
  tripCreateValidator,
  tripUpdateValidator,
  mongoIdParamValidator,
} = require("../utils/validators");

const {
  createTrip,
  getAllTrips,
  getTripHistory,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

// Protect all trip routes
router.use(authMiddleware);

// GET /api/trips/history - Get trip history (Must be registered BEFORE /:id)
router.get("/history", getTripHistory);

// POST /api/trips - Request a trip
router.post("/", tripCreateValidator, validateRequest, createTrip);

// GET /api/trips - Get all trips
router.get("/", getAllTrips);

// GET /api/trips/:id - Get specific trip details
router.get("/:id", mongoIdParamValidator("id"), validateRequest, getTripById);

// PUT /api/trips/:id - Update trip details
router.put(
  "/:id",
  [...mongoIdParamValidator("id"), ...tripUpdateValidator],
  validateRequest,
  updateTrip
);

// DELETE /api/trips/:id - Cancel/Soft-delete a trip
router.delete("/:id", mongoIdParamValidator("id"), validateRequest, deleteTrip);

module.exports = router;
