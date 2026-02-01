/**
 * Geographic utility functions for distance calculation and formatting
 */

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula
 * 
 * @param lat1 - Latitude of the first point in degrees
 * @param lon1 - Longitude of the first point in degrees
 * @param lat2 - Latitude of the second point in degrees
 * @param lon2 - Longitude of the second point in degrees
 * @returns Distance in kilometers
 * 
 * @example
 * // Calculate distance between Jakarta and Bandung
 * const distance = calculateDistance(-6.2088, 106.8456, -6.9175, 107.6191)
 * // Returns approximately 118.8 km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Earth's radius in kilometers
  const R = 6371

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Format a distance value for display
 * 
 * @param km - Distance in kilometers
 * @returns Formatted string with appropriate unit (m or km)
 * 
 * @example
 * formatDistance(0.5)   // "500 m"
 * formatDistance(1.5)   // "1.5 km"
 * formatDistance(25)    // "25.0 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}
