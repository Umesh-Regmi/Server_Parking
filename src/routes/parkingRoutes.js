import express from 'express';
import {
  addParkingSpot,
  getAllParkingSpots,
  getById,
} from "../controllers/parkingController.js";

const router = express.Router();

router.post('/', addParkingSpot);
router.get('/', getAllParkingSpots);
router.get("/:id", getById);

export default router;
