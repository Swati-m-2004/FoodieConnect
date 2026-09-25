/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 * Supports both:
 * - calculateDistance(lat1, lon1, lat2, lon2)
 * - calculateCoordinatesDistance([lon1, lat1], [lon2, lat2])
 */

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined
  ) {
    return Infinity;
  }

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function calculateCoordinatesDistance(coord1, coord2) {
  // GeoJSON is [longitude, latitude]
  if (!Array.isArray(coord1) || !Array.isArray(coord2) || coord1.length < 2 || coord2.length < 2) {
    return Infinity;
  }
  const lon1 = coord1[0];
  const lat1 = coord1[1];
  const lon2 = coord2[0];
  const lat2 = coord2[1];

  return calculateDistance(lat1, lon1, lat2, lon2);
}

function isWithinRadius(userCoords, restaurantCoords, radiusKm) {
  const distance = calculateCoordinatesDistance(userCoords, restaurantCoords);
  return {
    isDeliverable: distance <= radiusKm,
    distance,
  };
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

module.exports = {
  calculateDistance,
  calculateCoordinatesDistance,
  isWithinRadius,
};
