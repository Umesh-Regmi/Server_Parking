import mongoose from "mongoose";

const ParkingSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    totalSlots: { type: Number, required: true },
    price: { type: Number, required: false },
    availableSlots: { type: Number, required: true },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // ✅ NEW: reference to the spot host user
    edges: [
      {
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ParkingSpot",
        },
        distance: Number,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
ParkingSpotSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });
ParkingSpotSchema.index({ name: "text" });

// Auto-update isAvailable before saving
ParkingSpotSchema.pre("save", function (next) {
  this.isAvailable = this.availableSlots > 0;
  next();
});

const ParkingSpot = mongoose.model("parkingSpot", ParkingSpotSchema);
export default ParkingSpot;
