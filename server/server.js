import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


// MongoDB Connection

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();


// CORS (FIXED)

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL_DEV,
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

//  REQUIRED for preflight
app.options("*", cors());


// Middleware

app.use(express.json());
app.use(morgan("dev"));

// Routes

app.use("/api/auth", authRoutes);
app.use("/api", planRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});


// Start Server

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});