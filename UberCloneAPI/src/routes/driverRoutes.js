const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validationMiddleware");

const {
  driverRegisterValidator,
  driverUpdateValidator,
  mongoIdParamValidator,
} = require("../utils/validators");

const {
  registerDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
} = require("../controllers/driverController");

// Protect all driver routes
router.use(authMiddleware);

// POST /api/drivers - Register as a driver
router.post("/", driverRegisterValidator, validateRequest, registerDriver);

// GET /api/drivers - Get all drivers (supports query filtering)
router.get("/", getAllDrivers);

// GET /api/drivers/:id - Get driver by ID
router.get("/:id", mongoIdParamValidator("id"), validateRequest, getDriverById);

// PUT /api/drivers/:id - Update driver profile
router.put(
  "/:id",
  [...mongoIdParamValidator("id"), ...driverUpdateValidator],
  validateRequest,
  updateDriver
);

module.exports = router;
