import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import parkingRoutes from "./routes/parkingRoutes.js";
import pathRoutes from "./routes/pathRoutes.js";
import bookingRoutes from "./routes/booking.js";
import authRoutes from "./routes/auth.js";

const app = express();
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use("/api/parking", parkingRoutes);
app.use("/api/shortest-path", pathRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
