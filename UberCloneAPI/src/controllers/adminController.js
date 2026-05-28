const User = require("../models/User");
const Trip = require("../models/Trip");
const Payment = require("../models/Payment");

// ======================
// GET ALL USERS (ADMIN)
// ======================
const getAdminUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET ALL TRIPS (ADMIN)
// ======================
const getAdminTrips = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .sort({ createdAt: -1 })
      .populate("passenger", "fullName email phone")
      .populate({
        path: "driver",
        populate: { path: "userId", select: "fullName email phone" },
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
// GET ALL PAYMENTS (ADMIN)
// ======================
const getAdminPayments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email phone")
      .populate("tripId");

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminUsers,
  getAdminTrips,
  getAdminPayments,
};
