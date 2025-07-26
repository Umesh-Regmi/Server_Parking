export function dijkstra(startId, nodes) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = new Map();

  for (const node of nodes) {
    distances[node._id] = Infinity;
    previous[node._id] = null;
    pq.set(node._id.toString(), Infinity);
  }

  distances[startId] = 0;
  pq.set(startId, 0);

  while (pq.size > 0) {
    const [minNodeId] = [...pq.entries()].reduce((a, b) =>
      a[1] < b[1] ? a : b
    );

    pq.delete(minNodeId);
    visited.add(minNodeId);

    const current = nodes.find(n => n._id.toString() === minNodeId);

    if (!current) continue;

    for (const edge of current.edges) {
      const neighborId = edge.to.toString();
      if (visited.has(neighborId)) continue;

      const alt = distances[minNodeId] + edge.distance;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = minNodeId;
        pq.set(neighborId, alt);
      }
    }
  }

  return { distances, previous };
}

export function reconstructPath(previous, startId, endId) {
  const path = [];
  let current = endId;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path[0] === startId ? path : [];
}
