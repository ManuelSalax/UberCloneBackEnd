const axios = require("axios");
const { calculateFare } = require("./fareService");

/**
 * Helper to calculate direct distance between two lat/lng coordinates (Haversine formula).
 * Useful for the mock fallback.
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Parse coordinates from string like "latitude,longitude"
 */
const parseCoords = (coordStr) => {
  if (!coordStr) return null;
  const parts = coordStr.split(",");
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

/**
 * Autocomplete Service: Google Places API
 */
const getAutocomplete = async (input) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set. Using mock autocomplete data.");
    return getMockAutocomplete(input);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${apiKey}&language=es&components=country:co`;
    const response = await axios.get(url);

    if (response.data.status === "OK") {
      return response.data.predictions.map((p) => ({
        description: p.description,
        placeId: p.place_id,
        mainText: p.structured_formatting ? p.structured_formatting.main_text : p.description,
        secondaryText: p.structured_formatting ? p.structured_formatting.secondary_text : "",
      }));
    } else {
      console.warn(`Google Places API returned status: ${response.data.status}. Falling back to mock.`);
      return getMockAutocomplete(input);
    }
  } catch (error) {
    console.error("Google Places API error, using mock fallback:", error.message);
    return getMockAutocomplete(input);
  }
};

/**
 * Directions Service: Google Directions API
 */
const getDirections = async (origin, destination) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set. Using mock directions data.");
    return getMockDirections(origin, destination);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&key=${apiKey}&language=es`;
    const response = await axios.get(url);

    if (response.data.status === "OK") {
      return response.data.routes[0];
    } else {
      console.warn(`Google Directions API returned status: ${response.data.status}. Falling back to mock.`);
      return getMockDirections(origin, destination);
    }
  } catch (error) {
    console.error("Google Directions API error, using mock fallback:", error.message);
    return getMockDirections(origin, destination);
  }
};

/**
 * Distance Matrix Service: Google Distance Matrix API
 */
const getDistanceAndDuration = async (origin, destination, vehicleType = "Economy") => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  let distanceKm = 0;
  let durationMins = 0;
  let formattedDistance = "";
  let formattedDuration = "";

  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set. Using mock distance matrix.");
    const mock = getMockDistanceMatrix(origin, destination);
    distanceKm = mock.distanceKm;
    durationMins = mock.durationMins;
    formattedDistance = mock.formattedDistance;
    formattedDuration = mock.formattedDuration;
  } else {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origin
      )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}&language=es`;
      const response = await axios.get(url);

      if (response.data.status === "OK" && response.data.rows[0].elements[0].status === "OK") {
        const element = response.data.rows[0].elements[0];
        const distanceValue = element.distance.value; // meters
        const durationValue = element.duration.value; // seconds

        distanceKm = distanceValue / 1000;
        durationMins = Math.round(durationValue / 60);
        formattedDistance = element.distance.text;
        formattedDuration = element.duration.text;
      } else {
        console.warn("Google Distance Matrix API returned error status. Using mock.");
        const mock = getMockDistanceMatrix(origin, destination);
        distanceKm = mock.distanceKm;
        durationMins = mock.durationMins;
        formattedDistance = mock.formattedDistance;
        formattedDuration = mock.formattedDuration;
      }
    } catch (error) {
      console.error("Google Distance Matrix API error, using mock:", error.message);
      const mock = getMockDistanceMatrix(origin, destination);
      distanceKm = mock.distanceKm;
      durationMins = mock.durationMins;
      formattedDistance = mock.formattedDistance;
      formattedDuration = mock.formattedDuration;
    }
  }

  // Calculate fares for all vehicle types
  const fareEconomy = calculateFare(distanceKm, "Economy");
  const fareXL = calculateFare(distanceKm, "XL");
  const farePremium = calculateFare(distanceKm, "Premium");

  const selectedFare = calculateFare(distanceKm, vehicleType);

  return {
    distance: formattedDistance,
    duration: formattedDuration,
    fare: selectedFare,
    distanceValueKm: distanceKm,
    durationValueMins: durationMins,
    fares: {
      Economy: fareEconomy,
      XL: fareXL,
      Premium: farePremium,
    },
  };
};

// ======================
// Mock Fallbacks
// ======================

const getMockAutocomplete = (input) => {
  const query = input ? input.toLowerCase() : "";
  const baseMock = [
    {
      description: "Centro Comercial Andino, Carrera 11 # 82-71, Bogotá, Colombia",
      placeId: "mock_place_andino",
      mainText: "Centro Comercial Andino",
      secondaryText: "Carrera 11 # 82-71, Bogotá, Colombia",
    },
    {
      description: "Parque de la 93, Calle 93 # 11A-27, Bogotá, Colombia",
      placeId: "mock_place_parque93",
      mainText: "Parque de la 93",
      secondaryText: "Calle 93 # 11A-27, Bogotá, Colombia",
    },
    {
      description: "Aeropuerto Internacional El Dorado, Avenida El Dorado # 103-9, Bogotá, Colombia",
      placeId: "mock_place_eldorado",
      mainText: "Aeropuerto Internacional El Dorado",
      secondaryText: "Avenida El Dorado # 103-9, Bogotá, Colombia",
    },
    {
      description: "Terminal de Transportes de Bogotá, Diagonal 23 # 69-60, Bogotá, Colombia",
      placeId: "mock_place_terminal",
      mainText: "Terminal de Transportes",
      secondaryText: "Diagonal 23 # 69-60, Bogotá, Colombia",
    },
    {
      description: "Plaza de Bolívar, Carrera 7 # 11-10, Bogotá, Colombia",
      placeId: "mock_place_bolivar",
      mainText: "Plaza de Bolívar",
      secondaryText: "Carrera 7 # 11-10, Bogotá, Colombia",
    },
  ];

  if (!query) return baseMock;

  return baseMock.filter(
    (item) =>
      item.mainText.toLowerCase().includes(query) ||
      item.secondaryText.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );
};

const getMockDirections = (origin, destination) => {
  // Return standard Google Directions format mockup
  return {
    bounds: {
      northeast: { lat: 4.698, lng: -74.03 },
      southwest: { lat: 4.609, lng: -74.08 },
    },
    copyrights: "Map data ©2026 Google (Mocked)",
    legs: [
      {
        distance: { text: "8.4 km", value: 8400 },
        duration: { text: "22 min", value: 1320 },
        end_address: destination,
        end_location: { lat: 4.697, lng: -74.032 },
        start_address: origin,
        start_location: { lat: 4.61, lng: -74.072 },
        steps: [
          {
            distance: { text: "1.2 km", value: 1200 },
            duration: { text: "3 min", value: 180 },
            end_location: { lat: 4.62, lng: -74.07 },
            html_instructions: "Inicia por la <b>Carrera 7</b> al norte.",
            start_location: { lat: 4.61, lng: -74.072 },
            travel_mode: "DRIVING",
          },
          {
            distance: { text: "7.2 km", value: 7200 },
            duration: { text: "19 min", value: 1140 },
            end_location: { lat: 4.697, lng: -74.032 },
            html_instructions: "Gira a la derecha por la <b>Calle 92</b> y toma la Autopista Norte.",
            start_location: { lat: 4.62, lng: -74.07 },
            travel_mode: "DRIVING",
          },
        ],
      },
    ],
    overview_polyline: {
      points: "q`g_@y~kbNo@eAc@iAgBoFe@yAy@qCcBqFiBqF_C_HoCoIaDiKiDqKeEgLoEiLo@aB",
    },
    summary: "Autopista Norte",
    warnings: [],
    waypoint_order: [],
  };
};

const getMockDistanceMatrix = (origin, destination) => {
  const oCoords = parseCoords(origin);
  const dCoords = parseCoords(destination);

  let distanceKm = 6.8; // default mock value

  if (oCoords && dCoords) {
    // Calculate geographic distance
    const direct = calculateHaversineDistance(
      oCoords.lat,
      oCoords.lng,
      dCoords.lat,
      dCoords.lng
    );
    // Road distance is usually 1.25x larger than direct line
    distanceKm = parseFloat((direct * 1.28).toFixed(1));
    if (distanceKm < 0.2) distanceKm = 0.5; // minimum distance
  } else {
    // Generate static deterministic distance based on length of strings
    const sumLen = (origin || "").length + (destination || "").length;
    distanceKm = parseFloat((5 + (sumLen % 15) + Math.random() * 2).toFixed(1));
  }

  // Assume avg city speed 22 km/h -> 2.7 mins per km, plus some stoplight buffers
  const durationMins = Math.round(distanceKm * 2.5 + 4);

  return {
    distanceKm,
    durationMins,
    formattedDistance: `${distanceKm} km`,
    formattedDuration: `${durationMins} min`,
  };
};

module.exports = {
  getAutocomplete,
  getDirections,
  getDistanceAndDuration,
  calculateHaversineDistance,
};
