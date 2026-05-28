/**
 * Fare Calculation Rules:
 * - Economy: Base 5000 COP, 1200 COP per km
 * - XL: Base 8000 COP, 1800 COP per km
 * - Premium: Base 12000 COP, 2500 COP per km
 */

const FARE_RULES = {
  Economy: {
    base: 5000,
    perKm: 1200,
  },
  XL: {
    base: 8000,
    perKm: 1800,
  },
  Premium: {
    base: 12000,
    perKm: 2500,
  },
};

/**
 * Calculates fare for a trip based on distance and vehicle type.
 * @param {number} distanceInKm Distance of the ride in kilometers
 * @param {string} vehicleType Vehicle type ("Economy", "XL", "Premium")
 * @returns {number} The calculated fare rounded to the nearest integer
 */
const calculateFare = (distanceInKm, vehicleType) => {
  const rules = FARE_RULES[vehicleType];
  
  if (!rules) {
    throw new Error(`Invalid vehicle type: ${vehicleType}. Must be one of Economy, XL, Premium.`);
  }

  const distance = Math.max(0, Number(distanceInKm) || 0);
  const fare = rules.base + distance * rules.perKm;

  // Rounding to nearest COP
  return Math.round(fare);
};

module.exports = {
  calculateFare,
  FARE_RULES,
};
