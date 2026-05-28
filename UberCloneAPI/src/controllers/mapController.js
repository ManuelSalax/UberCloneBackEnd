const googleMapsService = require("../services/googleMapsService");

// ======================
// AUTOCOMPLETE PLACES
// ======================
const getAutocomplete = async (req, res, next) => {
  try {
    const { input } = req.query;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'input' is required.",
      });
    }

    const suggestions = await googleMapsService.getAutocomplete(input);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET DIRECTIONS
// ======================
const getDirections = async (req, res, next) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: "Query parameters 'origin' and 'destination' are required.",
      });
    }

    const route = await googleMapsService.getDirections(origin, destination);

    res.status(200).json({
      success: true,
      route,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET DISTANCE AND FARE
// ======================
const getDistanceMatrix = async (req, res, next) => {
  try {
    const { origin, destination, vehicleType } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: "Query parameters 'origin' and 'destination' are required.",
      });
    }

    const selectedType = vehicleType || "Economy";

    const matrix = await googleMapsService.getDistanceAndDuration(
      origin,
      destination,
      selectedType
    );

    // Standardized response format as requested by user
    res.status(200).json({
      success: true,
      distance: matrix.distance,
      duration: matrix.duration,
      fare: matrix.fare,
      distanceValueKm: matrix.distanceValueKm,
      durationValueMins: matrix.durationValueMins,
      fares: matrix.fares, // Full details breakdown
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAutocomplete,
  getDirections,
  getDistanceMatrix,
};
