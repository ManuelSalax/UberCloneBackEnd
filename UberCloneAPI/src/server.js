const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

// ======================
// Configuration
// ======================

dotenv.config();

// ======================
// Database
// ======================

const connectDB = require("./config/database");

// ======================
// Routes
// ======================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");
const mapRoutes = require("./routes/mapRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const rateLimit = require("express-rate-limit");
const { renderSwaggerUI } = require("./docs/swagger");

// ======================
// MongoDB Connection
// ======================

connectDB();

// ======================
// Express App
// ======================

const app = express();

// ======================
// Rate Limiter Security
// ======================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================
// Middlewares
// ======================

app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(morgan("dev"));
app.use(express.json());

// ======================
// Base Route
// ======================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "UberClone API running successfully"
  });
});

// ======================
// API Documentation
// ======================

app.get("/api/docs", renderSwaggerUI);

// ======================
// API Routes
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ======================
// Error Handler Middleware
// ======================

app.use(errorMiddleware);

// ======================
// Server
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});