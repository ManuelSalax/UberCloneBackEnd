const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    destinationLocation: {
      type: String,
      required: true,
      trim: true,
    },
    pickupCoordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    destinationCoordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    distance: {
      type: Number, // Stored in kilometers
      required: true,
    },
    duration: {
      type: Number, // Stored in minutes
      required: true,
    },
    fare: {
      type: Number, // Stored in COP
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["Economy", "XL", "Premium"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "DriverAssigned",
        "InProgress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);
