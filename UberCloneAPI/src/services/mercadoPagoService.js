const { MercadoPagoConfig, Preference } = require("mercadopago");

// Initialize Mercado Pago client safely
let mpClient = null;
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (accessToken && accessToken.trim() !== "") {
  try {
    mpClient = new MercadoPagoConfig({
      accessToken: accessToken,
    });
    console.log("Mercado Pago SDK initialized successfully with Access Token.");
  } catch (error) {
    console.error("Failed to initialize Mercado Pago SDK:", error.message);
  }
} else {
  console.warn("MERCADOPAGO_ACCESS_TOKEN not set or empty. Running in Mock/Developer sandbox mode.");
}

/**
 * Creates a Mercado Pago payment preference for a trip.
 * @param {string} tripId The ID of the Trip
 * @param {string} userEmail Email of the Passenger
 * @param {number} amount Amount to pay in COP
 * @returns {Promise<{preferenceId: string, initPoint: string}>}
 */
const createPreference = async (tripId, userEmail, amount) => {
  if (!mpClient) {
    // Generate mock details for local testing
    console.log(`[MOCK MERCADOPAGO] Creating preference for Trip: ${tripId}, User: ${userEmail}, Amount: ${amount}`);
    const mockPreferenceId = `pref_mock_${Math.random().toString(36).substring(2, 15)}`;
    
    // Return mock init points that direct to our webhook simulator for local testing ease
    const mockInitPoint = `http://localhost:${process.env.PORT || 5000}/api/payments/mock-checkout?preferenceId=${mockPreferenceId}&tripId=${tripId}&amount=${amount}`;
    
    return {
      preferenceId: mockPreferenceId,
      initPoint: mockInitPoint,
      sandboxInitPoint: mockInitPoint,
      isMock: true,
    };
  }

  try {
    const preference = new Preference(mpClient);
    
    const body = {
      items: [
        {
          id: tripId.toString(),
          title: "UberClone Trip Service",
          description: `Ride payment for trip reference: ${tripId}`,
          quantity: 1,
          unit_price: Number(amount),
          currency_id: "COP",
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `http://localhost:${process.env.PORT || 5000}/api/payments/success`,
        failure: `http://localhost:${process.env.PORT || 5000}/api/payments/failure`,
        pending: `http://localhost:${process.env.PORT || 5000}/api/payments/pending`,
      },
      auto_return: "approved",
      // Webhook notification URL
      notification_url: `https://your-public-webhook-domain.com/api/payments/webhook`,
      external_reference: tripId.toString(),
    };

    const response = await preference.create({ body });

    return {
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      isMock: false,
    };
  } catch (error) {
    console.error("Mercado Pago Preference creation error:", error);
    throw new Error(`Mercado Pago Error: ${error.message}`);
  }
};

/**
 * Gets payment details from Mercado Pago using the Payment ID
 * @param {string} paymentId Mercado Pago Payment ID
 * @returns {Promise<object>}
 */
const getPaymentDetails = async (paymentId) => {
  if (!mpClient || paymentId.startsWith("mock_")) {
    console.log(`[MOCK MERCADOPAGO] Fetching mock payment details for ID: ${paymentId}`);
    return {
      id: paymentId,
      status: "approved",
      status_detail: "accredited",
      transaction_amount: 15000,
      payment_method_id: "pix_or_creditcard",
      external_reference: "mock_trip_id",
    };
  }

  try {
    // Standard fetch via axios/rest to avoid complicated SDK class mapping for payments in some versions
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching payment details from Mercado Pago:", error.message);
    throw error;
  }
};

module.exports = {
  createPreference,
  getPaymentDetails,
  isMockEnabled: () => !mpClient,
};
