import express from "express";
import {
  addParkingSpot,
  getAllParkingSpots,
  getById,
  getHostParkingSpots,
} from "../controllers/parkingController.js";

const router = express.Router();

router.post("/:userId", addParkingSpot);
router.get("/", getAllParkingSpots);
router.get("/admin/:userId", getHostParkingSpots);
router.get("/:id", getById);

export default router;
