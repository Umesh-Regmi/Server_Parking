import express from 'express';
import { addParkingSpot, getAllParkingSpots } from '../controllers/parkingController.js';

const router = express.Router();

router.post('/', addParkingSpot);
router.get('/', getAllParkingSpots);

export default router;
