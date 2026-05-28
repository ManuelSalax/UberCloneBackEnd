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

// ======================
// MongoDB Connection
// ======================

connectDB();

// ======================
// Express App
// ======================

const app = express();

// ======================
// Middlewares
// ======================

app.use(cors());
app.use(helmet());
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
// API Routes
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ======================
// Server
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});