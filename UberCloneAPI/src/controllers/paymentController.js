const Payment = require("../models/Payment");
const Trip = require("../models/Trip");
const User = require("../models/User");
const mercadoPagoService = require("../services/mercadoPagoService");

// ======================
// CREATE PAYMENT PREFERENCE
// ======================
const createPayment = async (req, res, next) => {
  try {
    const { tripId } = req.body;
    const userId = req.user.userId;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "tripId is required in request body.",
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    // Security: Only the passenger of the trip can initiate the payment
    if (trip.passenger.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to pay for this trip.",
      });
    }

    // Fetch passenger's email
    const passenger = await User.findById(userId);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger user account not found.",
      });
    }

    // Call Mercado Pago service
    const preference = await mercadoPagoService.createPreference(
      tripId,
      passenger.email,
      trip.fare
    );

    // Save initial Payment record in DB
    const newPayment = new Payment({
      tripId,
      userId,
      amount: trip.fare,
      currency: "COP",
      paymentMethod: "Mercado Pago",
      status: "Pending",
      mercadoPagoPreferenceId: preference.preferenceId,
    });

    await newPayment.save();

    res.status(201).json({
      success: true,
      message: "Payment preference created successfully.",
      preferenceId: preference.preferenceId,
      initPoint: preference.initPoint,
      sandboxInitPoint: preference.sandboxInitPoint,
      isMock: preference.isMock || false,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// GET PAYMENT BY ID
// ======================
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("userId", "fullName email phone")
      .populate("tripId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    // Security: Passengers can view their payments, Drivers can view their trip payments, Admins can view all
    if (
      req.user.role !== "ADMIN" &&
      payment.userId._id.toString() !== req.user.userId &&
      (!payment.tripId.driver || payment.tripId.driver.toString() !== req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to view this payment.",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// WEBHOOK NOTIFICATION
// ======================
const processWebhook = async (req, res, next) => {
  try {
    console.log("Mercado Pago Webhook Received:", req.query, req.body);

    // Mercado Pago webhook format:
    // Query contains topic/type and id
    // e.g. /webhook?type=payment&data.id=12345678
    // or /webhook?topic=payment&id=12345678
    const type = req.query.type || req.query.topic || req.body.type;
    const paymentId = req.query["data.id"] || req.query.id || (req.body.data && req.body.data.id);

    if (type === "payment" && paymentId) {
      // Fetch details from Mercado Pago API
      const details = await mercadoPagoService.getPaymentDetails(paymentId);

      if (details) {
        const tripId = details.external_reference;
        const mpStatus = details.status; // 'approved', 'rejected', 'pending', etc.

        // Map MP status to local payment status
        let mappedStatus = "Pending";
        if (mpStatus === "approved") {
          mappedStatus = "Approved";
        } else if (mpStatus === "rejected") {
          mappedStatus = "Rejected";
        } else if (mpStatus === "cancelled") {
          mappedStatus = "Cancelled";
        }

        // Find and update the local payment record
        const payment = await Payment.findOne({
          $or: [{ tripId: tripId }, { mercadoPagoPreferenceId: details.preference_id }],
        });

        if (payment) {
          payment.status = mappedStatus;
          payment.mercadoPagoPaymentId = paymentId.toString();
          await payment.save();

          // Update trip status on successful payment
          if (mappedStatus === "Approved") {
            const trip = await Trip.findById(payment.tripId);
            if (trip) {
              trip.status = "Completed";
              await trip.save();
              console.log(`Trip ${trip._id} has been automatically marked COMPLETED via payment webhook.`);
            }
          }
        }
      }
    }

    // Always respond 200/201 to Mercado Pago to avoid retries
    res.status(200).json({
      success: true,
      message: "Webhook processed.",
    });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    // Respond 200 anyway to prevent webhook retry flooding, but log it
    res.status(200).json({
      success: false,
      message: "Error processed silently",
    });
  }
};

// ======================
// MOCK CHECKOUT FLOW (HTML UI Helper)
// ======================
const renderMockCheckout = (req, res) => {
  const { preferenceId, tripId, amount } = req.query;

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pasarela de Pagos Mercado Pago - Simulación</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f7;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          padding: 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          color: #009ee3;
          margin-bottom: 24px;
        }
        .title {
          font-size: 20px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 8px;
        }
        .amount {
          font-size: 36px;
          font-weight: 800;
          color: #2e7d32;
          margin: 20px 0;
        }
        .details {
          text-align: left;
          background-color: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 28px;
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }
        .btn {
          display: block;
          width: 100%;
          padding: 14px;
          background-color: #009ee3;
          color: white;
          text-decoration: none;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #0087c2;
        }
        .btn-cancel {
          display: inline-block;
          margin-top: 14px;
          color: #888;
          font-size: 14px;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">mercado pago</div>
        <div class="title">Simulador de Transacción</div>
        <p style="color: #666; font-size: 14px; margin-top:0;">Estás en modo de desarrollo local sin credenciales reales.</p>
        
        <div class="amount">$${Number(amount).toLocaleString('es-CO')} COP</div>
        
        <div class="details">
          <strong>Referencia del Viaje:</strong> ${tripId}<br>
          <strong>ID Preferencia:</strong> ${preferenceId}<br>
          <strong>Método:</strong> Tarjeta de Crédito / Débito (Simulación)
        </div>

        <form action="/api/payments/webhook?type=payment&id=mock_pay_${Date.now()}" method="POST" id="payForm">
          <input type="hidden" name="preference_id" value="${preferenceId}">
          <input type="hidden" name="trip_id" value="${tripId}">
          <button type="submit" class="btn">Confirmar Pago (Aprobar Simulación)</button>
        </form>
        
        <script>
          document.getElementById('payForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Send webhook hit asynchronously
            fetch(this.action, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'payment',
                data: { id: 'mock_pay_' + Date.now() }
              })
            }).then(() => {
              alert('¡Pago Simulado Exitosamente! El webhook ha procesado la aprobación del viaje. Se te redirigirá a la app.');
              window.location.href = 'http://localhost:${process.env.PORT || 5000}/';
            });
          });
        </script>
      </div>
    </body>
    </html>
  `);
};

module.exports = {
  createPayment,
  getPaymentById,
  processWebhook,
  renderMockCheckout,
};
