import ParkingSpot from "../models/parkingspot.js";
import User from "../models/user.js";
import { haversineDistance } from "../utils/calcDistance.js";

import { dijkstra, reconstructPath } from "../utils/dijkstra.js";

function getDistance(a, b) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

export async function searchParkingSpots(req, res) {
  const { query = "", lat, lng } = req.query;

  try {
    const allSpots = await ParkingSpot.find().populate("edges.to");

    // 🌐 Find closest node to user location
    let startNode = null;
    if (lat && lng) {
      const userPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
      let minDist = Infinity;

      for (const spot of allSpots) {
        const dist = getDistance(userPos, spot.coordinates);
        if (dist < minDist) {
          minDist = dist;
          startNode = spot;
        }
      }
    }

    // 🧠 Text match filter
    const matchingSpots = allSpots.filter((spot) =>
      spot.name.toLowerCase().includes(query.toLowerCase())
    );

    if (!startNode) {
      return res.json({ spots: matchingSpots });
    }

    // 📈 Run Dijkstra from closest node
    const { distances, previous } = dijkstra(
      startNode._id.toString(),
      allSpots
    );

    const enriched = matchingSpots.map((spot) => {
      const id = spot._id.toString();
      const distance = distances[id] ?? Infinity;
      const path = reconstructPath(previous, startNode._id.toString(), id);

      return {
        ...spot.toObject(),
        distance,
        path,
      };
    });

    enriched.sort((a, b) => a.distance - b.distance);

    res.json({
      startSpot: startNode,
      spots: enriched,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function addParkingSpot(req, res) {
  try {
    const { userId } = req.params;

    // 1. Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check if user is a spot_host
    if (user.role !== "spot_host") {
      return res
        .status(403)
        .json({ message: "Only spot hosts can add parking spots" });
    }

    // 3. Create parking spot with user as host
    const newSpotData = {
      ...req.body,
      host: user._id,
    };

    const newSpot = await ParkingSpot.create(newSpotData);

    // 4. Optional: Create edges (graph logic)
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

export async function getHostParkingSpots(req, res) {
  try {
    const spots = await ParkingSpot.find({ host: req.params.userId }).populate(
      "host",
      "name email role"
    );
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getById(req, res) {
  try {
    const spots = await ParkingSpot.findById(req.params.id);
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
