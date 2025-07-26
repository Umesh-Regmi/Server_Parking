import ParkingSpot from '../models/parkingspot.js';
import { dijkstra, reconstructPath } from '../utils/dijkstra.js';
import { haversineDistance } from '../utils/calcDistance.js';

export async function getShortestPath(req, res) {
  const { userLocation, destinationId } = req.body;
  if (!userLocation || !destinationId) {
    return res.status(400).json({ message: 'Missing userLocation or destinationId' });
  }

  const spots = await ParkingSpot.find();

  // Find nearest spot to user
  let nearestSpot = null;
  let nearestDistance = Infinity;

  spots.forEach(spot => {
    const dist = haversineDistance(userLocation, spot.coordinates);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestSpot = spot;
    }
  });

  if (!nearestSpot) {
    return res.status(404).json({ message: 'No parking spots found' });
  }

  // Build graph nodes with edges
  const graphNodes = spots.map(spot => ({
    _id: spot._id.toString(),
    edges: spot.edges.map(e => ({ to: e.to.toString(), distance: e.distance })),
  }));

  // Add temporary user node
  const userNodeId = 'user';
  graphNodes.push({
    _id: userNodeId,
    edges: [{ to: nearestSpot._id.toString(), distance: nearestDistance }],
  });

  // Add edge from nearestSpot back to user node (optional)
  graphNodes.forEach(node => {
    if (node._id === nearestSpot._id.toString()) {
      node.edges.push({ to: userNodeId, distance: nearestDistance });
    }
  });

  // Run Dijkstra
  const { previous } = dijkstra(userNodeId, graphNodes);
  const pathNodeIds = reconstructPath(previous, userNodeId, destinationId);

  if (!pathNodeIds.length) {
    return res.status(404).json({ message: 'No path found' });
  }

  // Get spots in path (excluding user node)
  const parkingSpotIds = pathNodeIds.filter(id => id !== userNodeId);
  const pathSpots = spots.filter(s => parkingSpotIds.includes(s._id.toString()));

  // Add user location at start
  const pathWithUser = [{ _id: userNodeId, coordinates: userLocation }, ...pathSpots];

  res.json({ path: pathWithUser });
}
