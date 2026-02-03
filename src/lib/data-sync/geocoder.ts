/**
 * Geocoder module for converting addresses to coordinates
 * Uses Nominatim (OpenStreetMap) as primary source
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Geocode a Taiwan address to coordinates
 * Rate limited to respect Nominatim usage policy (1 request per second)
 */
export async function geocodeAddress(
  address: string,
  city?: string
): Promise<GeocodingResult | null> {
  try {
    const fullAddress = city ? `${city}${address}` : address;
    const encodedAddress = encodeURIComponent(`${fullAddress}, Taiwan`);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=tw&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': `HeritageHunter/1.0 (${process.env.CONTACT_EMAIL || 'heritage-hunter@example.com'})`,
      },
    });

    if (!response.ok) {
      console.error(`Geocoding failed: ${response.status}`);
      return null;
    }

    const results = await response.json();

    if (results.length === 0) {
      return null;
    }

    const result = results[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      confidence: result.importance > 0.5 ? 'high' : result.importance > 0.3 ? 'medium' : 'low',
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Batch geocode with rate limiting (1 request per second)
 */
export async function batchGeocode(
  addresses: Array<{ address: string; city?: string }>,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, GeocodingResult | null>> {
  const results = new Map<string, GeocodingResult | null>();

  for (let i = 0; i < addresses.length; i++) {
    const { address, city } = addresses[i];
    const key = city ? `${city}${address}` : address;

    const result = await geocodeAddress(address, city);
    results.set(key, result);

    if (onProgress) {
      onProgress(i + 1, addresses.length);
    }

    // Rate limit: wait 1 second between requests
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
