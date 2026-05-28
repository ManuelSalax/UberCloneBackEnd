const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validationMiddleware");
const { mongoIdParamValidator } = require("../utils/validators");

const {
  createPayment,
  getPaymentById,
  processWebhook,
  renderMockCheckout,
} = require("../controllers/paymentController");

// PUBLIC ENDPOINTS (Mercado Pago notifications & Simulator page)
router.post("/webhook", processWebhook);
router.get("/mock-checkout", renderMockCheckout);

// PROTECTED ENDPOINTS (Requires login token)
router.post("/create", authMiddleware, createPayment);
router.get("/:id", authMiddleware, mongoIdParamValidator("id"), validateRequest, getPaymentById);

module.exports = router;
