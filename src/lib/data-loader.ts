import changhua from '@/data/changhua.json';
import chiayi from '@/data/chiayi.json';
import mockTaipei from '@/data/mock-taipei.json';
import { UnclaimedLand, SearchFilters } from './types';

// Combine all data sources
const allLandsData: UnclaimedLand[] = [
  ...(changhua as UnclaimedLand[]),
  ...(chiayi as UnclaimedLand[]),
  ...(mockTaipei as UnclaimedLand[])
];

/**
 * Get all unclaimed lands from all data sources
 */
export function getAllLands(): UnclaimedLand[] {
  return allLandsData;
}

/**
 * Search lands by query string and optional filters
 * @param query - Search query (searches in ownerName, district, section, landNumber)
 * @param filters - Optional filters for city and district
 */
export function searchLands(query: string, filters?: SearchFilters): UnclaimedLand[] {
  let results = allLandsData;

  // Apply city filter
  if (filters?.city) {
    results = results.filter(land => land.sourceCity === filters.city);
  }

  // Apply district filter
  if (filters?.district) {
    results = results.filter(land => land.district === filters.district);
  }

  // Apply search query
  if (query.trim()) {
    const lowerQuery = query.toLowerCase().trim();
    results = results.filter(land => {
      return (
        land.ownerName.toLowerCase().includes(lowerQuery) ||
        land.district.toLowerCase().includes(lowerQuery) ||
        land.section.toLowerCase().includes(lowerQuery) ||
        land.landNumber.toLowerCase().includes(lowerQuery) ||
        land.id.toLowerCase().includes(lowerQuery)
      );
    });
  }

  return results;
}

/**
 * Get list of all available cities
 */
export function getCities(): string[] {
  const cities = Array.from(new Set(allLandsData.map(land => land.sourceCity)));
  return cities.sort();
}

/**
 * Get list of districts for a specific city
 */
export function getDistricts(city: string): string[] {
  const cityData = allLandsData.filter(land => land.sourceCity === city);
  const districts = Array.from(new Set(cityData.map(land => land.district)));
  return districts.sort();
}

/**
 * Get a single land by ID
 */
export function getLandById(id: string): UnclaimedLand | undefined {
  return allLandsData.find(land => land.id === id);
}

/**
 * Get statistics about the dataset
 */
export function getStatistics() {
  const totalLands = allLandsData.length;
  const totalAreaM2 = allLandsData.reduce((sum, land) => sum + land.areaM2, 0);
  const totalAreaPing = allLandsData.reduce((sum, land) => sum + land.areaPing, 0);
  const byCity = allLandsData.reduce((acc, land) => {
    acc[land.sourceCity] = (acc[land.sourceCity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalLands,
    totalAreaM2: Math.round(totalAreaM2 * 100) / 100,
    totalAreaPing: Math.round(totalAreaPing * 100) / 100,
    byCity
  };
}
