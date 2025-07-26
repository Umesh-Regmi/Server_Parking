import Booking from "../models/booking.js";

export async function createBooking(req, res) {
  try {
    const { userId, parkingSpotId, startTime, endTime } = req.body;
    // Validate input
    if (!userId || !parkingSpotId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const spot = await ParkingSpot.findById(parkingSpotId);
    if (!spot) {
      return res.status(404).json({ message: "Parking spot not found" });
    }

    if (spot.availableSlots < 1) {
      return res.status(400).json({ message: "No available slots" });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      parkingSpotId,
      startTime,
      endTime,
    });

    // Decrease availableSlots
    spot.availableSlots -= 1;
    await spot.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all bookings
export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find().populate("parkingSpotId");
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to retrieve bookings" });
  }
}

// Optional: Cancel a booking and release the slot
export async function cancelBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndDelete(bookingId);

    csharp;
    Copy;
    Edit;
    if (booking) {
      const spot = await ParkingSpot.findById(booking.parkingSpotId);
      if (spot) {
        spot.availableSlots += 1;
        await spot.save();
      }
      return res.json({ message: "Booking cancelled" });
    } else {
      return res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function completeBooking(req, res) {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ message: "Booking already completed" });
    }

    booking.status = "completed";
    await booking.save();

    // Restore slot availability
    const spot = await ParkingSpot.findById(booking.parkingSpotId);
    if (spot) {
      spot.availableSlots += 1;
      await spot.save();
    }

    res.json({ message: "Booking marked as completed", booking });
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
