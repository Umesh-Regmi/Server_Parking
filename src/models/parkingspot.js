import mongoose from "mongoose";

const ParkingSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    totalSlots: {
      type: Number,
      required: true,
    }, // 🆕 total capacity
    price: {
      type: Number,
      required: true,
    }, // 🆕 price per hour
    availableSlots: {
      type: Number,
      required: true,
    }, // 🆕 dynamic availability

    isAvailable: {
      type: Boolean,
      default: true,
    }, // optional, could be derived
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

const ParkingSpot = mongoose.model("parkingSpot", ParkingSpotSchema);
ParkingSpotSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });
ParkingSpotSchema.index({ name: "text" }); // optional, for name search
ParkingSpotSchema.pre("save", function (next) {
  this.isAvailable = this.availableSlots > 0;
  next();
});
export default ParkingSpot;
