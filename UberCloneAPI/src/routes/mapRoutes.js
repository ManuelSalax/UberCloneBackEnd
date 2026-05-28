const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAutocomplete,
  getDirections,
  getDistanceMatrix,
} = require("../controllers/mapController");

// Protect all maps routes
router.use(authMiddleware);

// GET /api/maps/autocomplete
router.get("/autocomplete", getAutocomplete);

// GET /api/maps/directions
router.get("/directions", getDirections);

// GET /api/maps/distance
router.get("/distance", getDistanceMatrix);

module.exports = router;
