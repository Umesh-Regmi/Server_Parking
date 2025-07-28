import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      // default: () => uuidv4().split("-")[0],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    parkingSpot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parkingSpot",
      required: true,
    },

    slotNumber: {
      type: Number,
      required: false,
    },

    startTime: {
      type: Date,
      required: false,
    },

    endTime: {
      type: Date,
      required: false,
    },
    vehicle: {
      number: {
        type: String,
        required: true, // Vehicle registration number
      },
      type: {
        type: String,
        enum: ["car", "bike", "truck", "van", "other"], // Vehicle category
        default: "car",
      },
      model: {
        type: String, // Optional: Vehicle model
      },
    },

    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
