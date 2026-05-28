const Driver = require("../models/Driver");
const User = require("../models/User");

// ======================
// REGISTER DRIVER
// ======================
const registerDriver = async (req, res, next) => {
  try {
    const {
      vehicleBrand,
      vehicleModel,
      vehiclePlate,
      vehicleColor,
      vehicleType,
      licenseNumber,
      currentLocation,
    } = req.body;

    // Use userId from body if admin is creating, otherwise use the authenticated user's ID
    const targetUserId = req.body.userId || req.user.userId;

    // Check if the user already has a driver profile
    const existingDriver = await Driver.findOne({ userId: targetUserId });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "User is already registered as a driver.",
      });
    }

    // Check if vehicle plate is already registered
    const existingPlate = await Driver.findOne({ vehiclePlate: vehiclePlate.toUpperCase() });
    if (existingPlate) {
      return res.status(400).json({
        success: false,
        message: "Vehicle plate is already registered.",
      });
    }

    // Check if license number is already registered
    const existingLicense = await Driver.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: "License number is already registered.",
      });
    }

    const driver = new Driver({
      userId: targetUserId,
      vehicleBrand,
      vehicleModel,
      vehiclePlate: vehiclePlate.toUpperCase(),
      vehicleColor,
      vehicleType,
      licenseNumber,
      currentLocation: currentLocation || { latitude: 0, longitude: 0 },
    });

    await driver.save();

    // Upgrade the user's role to DRIVER if not already an ADMIN
    const user = await User.findById(targetUserId);
    if (user && user.role === "PASSENGER") {
      user.role = "DRIVER";
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Driver registered successfully.",
      driver,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET ALL DRIVERS
// ======================
const getAllDrivers = async (req, res, next) => {
  try {
    const { isAvailable, vehicleType } = req.query;
    const filter = {};

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    const drivers = await Driver.find(filter).populate("userId", "fullName email phone gender profileImage");

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET DRIVER BY ID
// ======================
const getDriverById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id).populate("userId", "fullName email phone gender profileImage");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// UPDATE DRIVER
// ======================
const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find the driver profile first
    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found.",
      });
    }

    // Security: Drivers can only update their own profile unless they are an ADMIN
    if (req.user.role !== "ADMIN" && driver.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own driver profile.",
      });
    }

    // Prevent direct modification of userId
    delete updateData.userId;

    if (updateData.vehiclePlate) {
      updateData.vehiclePlate = updateData.vehiclePlate.toUpperCase();
      // Ensure plate is unique if changed
      const existingPlate = await Driver.findOne({
        vehiclePlate: updateData.vehiclePlate,
        _id: { $ne: id },
      });
      if (existingPlate) {
        return res.status(400).json({
          success: false,
          message: "Vehicle plate is already registered by another driver.",
        });
      }
    }

    if (updateData.licenseNumber) {
      // Ensure license is unique if changed
      const existingLicense = await Driver.findOne({
        licenseNumber: updateData.licenseNumber,
        _id: { $ne: id },
      });
      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: "License number is already registered by another driver.",
        });
      }
    }

    const updatedDriver = await Driver.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "fullName email phone gender profileImage");

    res.status(200).json({
      success: true,
      message: "Driver profile updated successfully.",
      driver: updatedDriver,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
};
