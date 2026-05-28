const Trip = require("../models/Trip");
const Driver = require("../models/Driver");
const googleMapsService = require("../services/googleMapsService");

// ======================
// CREATE TRIP REQUEST
// ======================
const createTrip = async (req, res, next) => {
  try {
    const {
      pickupLocation,
      destinationLocation,
      pickupCoordinates,
      destinationCoordinates,
      vehicleType,
    } = req.body;

    const passengerId = req.user.userId;

    // Convert coordinates to string representation for Google Maps API
    const originStr = `${pickupCoordinates.latitude},${pickupCoordinates.longitude}`;
    const destStr = `${destinationCoordinates.latitude},${destinationCoordinates.longitude}`;

    // Fetch distance, duration and fares from googleMapsService
    const routeDetails = await googleMapsService.getDistanceAndDuration(
      originStr,
      destStr,
      vehicleType
    );

    const trip = new Trip({
      passenger: passengerId,
      pickupLocation,
      destinationLocation,
      pickupCoordinates,
      destinationCoordinates,
      distance: routeDetails.distanceValueKm,
      duration: routeDetails.durationValueMins,
      fare: routeDetails.fare,
      vehicleType,
      status: "Pending",
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: "Trip requested successfully.",
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET ALL TRIPS
// ======================
const getAllTrips = async (req, res, next) => {
  try {
    const { status, vehicleType } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    const trips = await Trip.find(filter)
      .populate("passenger", "fullName email phone gender profileImage")
      .populate({
        path: "driver",
        populate: { path: "userId", select: "fullName email phone gender profileImage" },
      });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET TRIP HISTORY
// ======================
const getTripHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { role } = req.user;
    let filter = {};

    // Determine user role and search history
    if (role === "DRIVER") {
      // Find driver profile first
      const driver = await Driver.findOne({ userId });
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver profile not found.",
        });
      }
      filter = { driver: driver._id };
    } else if (role === "PASSENGER") {
      filter = { passenger: userId };
    } else {
      // ADMIN or fallback can see all or require role selection
      const { asRole } = req.query;
      if (asRole === "DRIVER") {
        const driver = await Driver.findOne({ userId });
        filter = driver ? { driver: driver._id } : { passenger: userId };
      } else {
        filter = { passenger: userId };
      }
    }

    const trips = await Trip.find(filter)
      .sort({ createdAt: -1 })
      .populate("passenger", "fullName email phone gender profileImage")
      .populate({
        path: "driver",
        populate: { path: "userId", select: "fullName email phone gender profileImage" },
      });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET TRIP BY ID
// ======================
const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate("passenger", "fullName email phone gender profileImage")
      .populate({
        path: "driver",
        populate: { path: "userId", select: "fullName email phone gender profileImage" },
      });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// UPDATE TRIP
// ======================
const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const updateFields = {};

    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver profile not found.",
        });
      }
      updateFields.driver = driverId;
    }

    if (status) {
      // Validate state transition if needed
      updateFields.status = status;
    }

    const updatedTrip = await Trip.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate("passenger", "fullName email phone gender profileImage")
      .populate({
        path: "driver",
        populate: { path: "userId", select: "fullName email phone" },
      });

    res.status(200).json({
      success: true,
      message: "Trip updated successfully.",
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// CANCEL / DELETE TRIP
// ======================
const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    // Soft delete / Cancel trip
    trip.status = "Cancelled";
    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trip has been cancelled successfully.",
      trip,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripHistory,
  getTripById,
  updateTrip,
  deleteTrip,
};
