import express from "express";
import {
  createBooking,
  getAllBookings,
  cancelBooking,
  completeBooking,
  getByUserId,
} from "../controllers/bookings.js";

const router = express.Router();

router.post("/", createBooking);

router.get("/", getAllBookings);

router.delete("/:bookingId", cancelBooking);
router.get("/user/:userId", getByUserId);


router.patch("/complete/:bookingId", completeBooking);

export default router;
