function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreNgo(ngo, donation) {
  const { pickupLat, pickupLng, quantity, expiryTime } = donation;
  let distanceScore = 0.4;
  let distanceKm = null;

  if (pickupLat != null && pickupLng != null && ngo.lat != null && ngo.lng != null) {
    distanceKm = haversineKm(pickupLat, pickupLng, ngo.lat, ngo.lng);
    distanceScore = Math.max(0, 1 - Math.min(distanceKm, 100) / 100);
  }

  const capacity = ngo.vehicleAvailability || 0;
  const capacityScore =
    capacity <= 0 ? 0.35 : Math.min(1, capacity / Math.max(quantity, 1));

  const hoursToExpiry = (new Date(expiryTime) - Date.now()) / (1000 * 60 * 60);
  const urgencyScore = hoursToExpiry <= 4 ? 1 : hoursToExpiry <= 12 ? 0.7 : 0.5;

  const vehicleScore = capacity > 0 ? 1 : 0.25;

  const total =
    distanceScore * 0.45 + capacityScore * 0.3 + vehicleScore * 0.15 + urgencyScore * 0.1;

  return {
    ngoId: ngo._id,
    ngoName: ngo.name,
    score: Math.round(total * 100) / 100,
    distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
    breakdown: { distanceScore, capacityScore, vehicleScore, urgencyScore },
  };
}

function findBestNgo(ngos, donation) {
  if (!ngos.length) return null;
  const ranked = ngos
    .map((ngo) => scoreNgo(ngo, donation))
    .sort((a, b) => b.score - a.score);
  return ranked[0] || null;
}

module.exports = { findBestNgo, scoreNgo, haversineKm };
