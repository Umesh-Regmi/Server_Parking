import ParkingSpot from "../models/parkingspot.js";
import { haversineDistance } from "../utils/calcDistance.js";

export async function addParkingSpot(req, res) {
  try {
    const newSpot = await ParkingSpot.create(req.body);

    // Create edges after spot added
    await createEdgesForNewSpot(newSpot);

    res.status(201).json(newSpot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAllParkingSpots(req, res) {
  try {
    const spots = await ParkingSpot.find();
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Helper to create edges for new spot
async function createEdgesForNewSpot(newSpot, radiusKm = 1) {
  const lat = newSpot.coordinates.lat;
  const lng = newSpot.coordinates.lng;
  const delta = radiusKm / 111;

  const nearbySpots = await ParkingSpot.find({
    _id: { $ne: newSpot._id },
    "coordinates.lat": { $gte: lat - delta, $lte: lat + delta },
    "coordinates.lng": { $gte: lng - delta, $lte: lng + delta },
  });

  const newSpotEdges = [];
  const bulkOps = [];

  for (const spot of nearbySpots) {
    const dist = haversineDistance(newSpot.coordinates, spot.coordinates);

    if (dist <= radiusKm) {
      // Edge from newSpot -> spot
      newSpotEdges.push({ to: spot._id, distance: dist });

      // Edge from spot -> newSpot
      spot.edges = spot.edges || [];
      if (!spot.edges.some((e) => e.to.toString() === newSpot._id.toString())) {
        spot.edges.push({ to: newSpot._id, distance: dist });
        bulkOps.push({
          updateOne: {
            filter: { _id: spot._id },
            update: { edges: spot.edges },
          },
        });
      }
    }
  }

  newSpot.edges = newSpotEdges;
  await newSpot.save();

  if (bulkOps.length) {
    await ParkingSpot.bulkWrite(bulkOps);
  }
}
