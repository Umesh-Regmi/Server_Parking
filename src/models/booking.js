import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
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
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
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
