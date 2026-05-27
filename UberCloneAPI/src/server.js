const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Configuración
dotenv.config();

// Base de datos
const connectDB = require("./config/database");

// Rutas
const authRoutes = require("./routes/authRoutes");

// Conexión MongoDB
connectDB();

// Inicialización de Express
const app = express();

// ======================
// Middlewares
// ======================

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ======================
// Routes
// ======================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "UberClone API running successfully",
  });
});

app.use("/api/auth", authRoutes);

// ======================
// Server
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});