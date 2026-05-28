const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");

/**
 * Custom check for valid MongoDB ObjectId.
 */
const isValidMongoId = (value) => mongoose.Types.ObjectId.isValid(value);

/**
 * Coordinate validator schema
 */
const validateCoordinates = (fieldPath) => {
  return [
    body(`${fieldPath}.latitude`)
      .isFloat({ min: -90, max: 90 })
      .withMessage(`${fieldPath}.latitude must be a float between -90 and 90`),
    body(`${fieldPath}.longitude`)
      .isFloat({ min: -180, max: 180 })
      .withMessage(`${fieldPath}.longitude must be a float between -180 and 180`),
  ];
};

// ======================
// USER / AUTH VALIDATORS
// ======================

const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 50 })
    .withMessage("Full name cannot exceed 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Must be a valid E.164 phone number"),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be either Male, Female, or Other"),
  body("language")
    .optional()
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage("Language code must be between 2 and 5 characters"),
  body("role")
    .optional()
    .trim()
    .isIn(["PASSENGER", "DRIVER", "ADMIN"])
    .withMessage("Role must be PASSENGER, DRIVER, or ADMIN"),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

const profileUpdateValidator = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Full name cannot exceed 50 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Must be a valid E.164 phone number"),
  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be either Male, Female, or Other"),
  body("language")
    .optional()
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage("Language code must be between 2 and 5 characters"),
  body("profileImage").optional().trim().isURL().withMessage("Profile image must be a valid URL"),
];

// ======================
// DRIVER VALIDATORS
// ======================

const driverRegisterValidator = [
  body("userId")
    .optional()
    .custom(isValidMongoId)
    .withMessage("userId must be a valid MongoDB ObjectId"),
  body("vehicleBrand").trim().notEmpty().withMessage("Vehicle brand is required"),
  body("vehicleModel").trim().notEmpty().withMessage("Vehicle model is required"),
  body("vehiclePlate")
    .trim()
    .notEmpty()
    .withMessage("Vehicle plate is required")
    .matches(/^[A-Z0-9-]{3,10}$/i)
    .withMessage("Vehicle plate must be a valid alphanumeric plate (3-10 characters)"),
  body("vehicleColor").trim().notEmpty().withMessage("Vehicle color is required"),
  body("vehicleType")
    .trim()
    .notEmpty()
    .withMessage("Vehicle type is required")
    .isIn(["Economy", "XL", "Premium"])
    .withMessage("Vehicle type must be Economy, XL, or Premium"),
  body("licenseNumber").trim().notEmpty().withMessage("License number is required"),
  body("isAvailable").optional().isBoolean().withMessage("isAvailable must be a boolean"),
  body("currentLocation").optional().isObject().withMessage("currentLocation must be an object containing latitude and longitude"),
  body("currentLocation.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a float between -90 and 90"),
  body("currentLocation.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a float between -180 and 180"),
];

const driverUpdateValidator = [
  body("vehicleBrand").optional().trim().notEmpty().withMessage("Vehicle brand cannot be empty"),
  body("vehicleModel").optional().trim().notEmpty().withMessage("Vehicle model cannot be empty"),
  body("vehiclePlate")
    .optional()
    .trim()
    .matches(/^[A-Z0-9-]{3,10}$/i)
    .withMessage("Vehicle plate must be a valid alphanumeric plate"),
  body("vehicleColor").optional().trim().notEmpty().withMessage("Vehicle color cannot be empty"),
  body("vehicleType")
    .optional()
    .isIn(["Economy", "XL", "Premium"])
    .withMessage("Vehicle type must be Economy, XL, or Premium"),
  body("licenseNumber").optional().trim().notEmpty().withMessage("License number cannot be empty"),
  body("isAvailable").optional().isBoolean().withMessage("isAvailable must be a boolean"),
  body("currentLocation").optional().isObject().withMessage("currentLocation must be an object"),
  body("currentLocation.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("currentLocation.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("rating").optional().isFloat({ min: 1, max: 5 }).withMessage("Rating must be a float between 1 and 5"),
];

// ======================
// TRIP VALIDATORS
// ======================

const tripCreateValidator = [
  body("pickupLocation").trim().notEmpty().withMessage("Pickup location is required"),
  body("destinationLocation").trim().notEmpty().withMessage("Destination location is required"),
  ...validateCoordinates("pickupCoordinates"),
  ...validateCoordinates("destinationCoordinates"),
  body("vehicleType")
    .trim()
    .notEmpty()
    .withMessage("Vehicle type is required")
    .isIn(["Economy", "XL", "Premium"])
    .withMessage("Vehicle type must be Economy, XL, or Premium"),
];

const tripUpdateValidator = [
  body("driverId")
    .optional()
    .custom(isValidMongoId)
    .withMessage("driverId must be a valid MongoDB ObjectId"),
  body("status")
    .optional()
    .isIn(["Pending", "Accepted", "DriverAssigned", "InProgress", "Completed", "Cancelled"])
    .withMessage("Invalid trip status"),
];

// ======================
// COMMON / GENERIC VALIDATORS
// ======================

const mongoIdParamValidator = (paramName) => [
  param(paramName).custom(isValidMongoId).withMessage(`Parameter '${paramName}' must be a valid MongoDB ObjectId`),
];

module.exports = {
  registerValidator,
  loginValidator,
  profileUpdateValidator,
  driverRegisterValidator,
  driverUpdateValidator,
  tripCreateValidator,
  tripUpdateValidator,
  mongoIdParamValidator,
  validateCoordinates,
};
