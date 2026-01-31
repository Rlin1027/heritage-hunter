/**
 * Universal Data Loader for Heritage Hunter
 * 
 * This module provides a unified interface for data loading that works in two modes:
 * 1. API Mode: When Supabase is configured, uses the /api endpoints
 * 2. Local Mode: Falls back to local JSON data for development/demo
 */

import changhua from '@/data/changhua.json';
import chiayi from '@/data/chiayi.json';
import mockTaipei from '@/data/mock-taipei.json';
import { mockLandData } from './mock-data';
import type { UnclaimedLand, SearchFilters, SearchResult, StatisticsData, CityData } from './types';
import {
  checkApiHealth,
  searchLandsApi,
  getCitiesApi,
  getDistrictsApi,
  getStatisticsApi,
  getLandByIdApi
} from './api-client';

// Combine all local data sources
const allLocalData: UnclaimedLand[] = [
  ...(changhua as UnclaimedLand[]),
  ...(chiayi as UnclaimedLand[]),
  ...(mockTaipei as UnclaimedLand[]),
  ...mockLandData,
];

// Cache for API availability status
let apiAvailable: boolean | null = null;
let lastApiCheck = 0;
const API_CHECK_INTERVAL = 60000; // Re-check every 60 seconds

/**
 * Checks if the API is available with 60-second caching
 *
 * Caches the result to avoid excessive health checks. Re-validates every 60 seconds.
 *
 * @returns {Promise<boolean>} True if API is reachable, false otherwise
 */
async function isApiAvailable(): Promise<boolean> {
  const now = Date.now();
  if (apiAvailable !== null && now - lastApiCheck < API_CHECK_INTERVAL) {
    return apiAvailable;
  }

  try {
    apiAvailable = await checkApiHealth();
  } catch {
    apiAvailable = false;
  }
  lastApiCheck = now;
  return apiAvailable;
}

/**
 * Forces a fresh API availability check on the next request
 *
 * Call this to bypass the cache and immediately re-check API status.
 *
 * @example
 * ```ts
 * // After Supabase configuration changes
 * refreshApiStatus();
 * const source = await getDataSource(); // Will re-check API
 * ```
 */
export function refreshApiStatus(): void {
  apiAvailable = null;
  lastApiCheck = 0;
}

/**
 * Determines the current data source
 *
 * @returns {Promise<'api' | 'local'>} 'api' if Supabase is configured and reachable, 'local' otherwise
 *
 * @example
 * ```tsx
 * const source = await getDataSource();
 * if (source === 'api') {
 *   console.log('Using live API data');
 * }
 * ```
 */
export async function getDataSource(): Promise<'api' | 'local'> {
  return (await isApiAvailable()) ? 'api' : 'local';
}

// ==========================================
// Search Functions
// ==========================================

/**
 * Searches for unclaimed lands with automatic API/local fallback
 *
 * Attempts to use the API first if available. Falls back to local data on error.
 *
 * @param {SearchFilters} [filters={}] - Search filters (city, district, query)
 * @param {number} [limit=50] - Maximum number of results per page
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<SearchResult>} Search results with pagination metadata
 *
 * @example
 * ```ts
 * const result = await searchLands(
 *   { city: '台北市', district: '大安區', query: '公園' },
 *   50,
 *   0
 * );
 * console.log(`Found ${result.pagination.total} results`);
 * ```
 */
export async function searchLands(
  filters: SearchFilters = {},
  limit = 50,
  offset = 0
): Promise<SearchResult> {
  // Try API first
  if (await isApiAvailable()) {
    try {
      return await searchLandsApi(filters, limit, offset);
    } catch (error) {
      console.warn('API search failed, falling back to local:', error);
      apiAvailable = false;
    }
  }

  // Fallback to local data
  return searchLandsLocal(filters, limit, offset);
}

/**
 * Searches lands using local JSON data only
 *
 * Internal function for local data searching with client-side filtering.
 *
 * @param {SearchFilters} filters - Search filters
 * @param {number} limit - Results per page
 * @param {number} offset - Pagination offset
 * @returns {SearchResult} Filtered and paginated results
 */
function searchLandsLocal(
  filters: SearchFilters,
  limit: number,
  offset: number
): SearchResult {
  let results = allLocalData;

  // Apply city filter
  if (filters.city) {
    results = results.filter(land => land.sourceCity === filters.city);
  }

  // Apply district filter
  if (filters.district) {
    results = results.filter(land => land.district === filters.district);
  }

  // Apply search query
  if (filters.query?.trim()) {
    const lowerQuery = filters.query.toLowerCase().trim();
    results = results.filter(land => (
      land.ownerName.toLowerCase().includes(lowerQuery) ||
      land.district.toLowerCase().includes(lowerQuery) ||
      land.section.toLowerCase().includes(lowerQuery) ||
      land.landNumber.toLowerCase().includes(lowerQuery) ||
      land.id.toLowerCase().includes(lowerQuery)
    ));
  }

  const total = results.length;
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    data: paginatedResults,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

// ==========================================
// Synchronous Local Functions (for backward compatibility)
// ==========================================

/**
 * Returns all lands from local data sources (synchronous)
 *
 * @returns {UnclaimedLand[]} Complete array of all local land records
 *
 * @example
 * ```ts
 * const allLands = getAllLandsLocal();
 * console.log(`Total local records: ${allLands.length}`);
 * ```
 */
export function getAllLandsLocal(): UnclaimedLand[] {
  return allLocalData;
}

/**
 * Synchronous search for backward compatibility (local data only)
 *
 * @param {string} query - Search query string
 * @param {{ city?: string; district?: string }} [filters] - Optional city/district filters
 * @returns {UnclaimedLand[]} Filtered land records
 *
 * @deprecated Use async `searchLands()` for API support
 */
export function searchLandsSync(query: string, filters?: { city?: string; district?: string }): UnclaimedLand[] {
  let results = allLocalData;

  if (filters?.city) {
    results = results.filter(land => land.sourceCity === filters.city);
  }

  if (filters?.district) {
    results = results.filter(land => land.district === filters.district);
  }

  if (query.trim()) {
    const lowerQuery = query.toLowerCase().trim();
    results = results.filter(land => (
      land.ownerName.toLowerCase().includes(lowerQuery) ||
      land.district.toLowerCase().includes(lowerQuery) ||
      land.section.toLowerCase().includes(lowerQuery) ||
      land.landNumber.toLowerCase().includes(lowerQuery)
    ));
  }

  return results;
}

// ==========================================
// City & District Functions
// ==========================================

/**
 * Retrieves all available cities with their districts
 *
 * Attempts API first, falls back to local data if unavailable.
 *
 * @returns {Promise<CityData[]>} Array of cities with their districts
 *
 * @example
 * ```ts
 * const cities = await getCities();
 * cities.forEach(city => {
 *   console.log(`${city.city}: ${city.districts.length} districts`);
 * });
 * ```
 */
export async function getCities(): Promise<CityData[]> {
  if (await isApiAvailable()) {
    try {
      return await getCitiesApi();
    } catch (error) {
      console.warn('API cities fetch failed, falling back to local:', error);
    }
  }

  return getCitiesLocal();
}

/**
 * Extracts cities and districts from local data
 *
 * @returns {CityData[]} Cities with sorted districts
 */
function getCitiesLocal(): CityData[] {
  const cityMap = new Map<string, Set<string>>();

  allLocalData.forEach(land => {
    if (!cityMap.has(land.sourceCity)) {
      cityMap.set(land.sourceCity, new Set());
    }
    cityMap.get(land.sourceCity)!.add(land.district);
  });

  return Array.from(cityMap.entries())
    .map(([city, districts]) => ({
      city,
      districts: Array.from(districts).sort(),
    }))
    .sort((a, b) => a.city.localeCompare(b.city, 'zh-TW'));
}

/**
 * Retrieves districts for a specific city
 *
 * @param {string} city - City name to get districts for
 * @returns {Promise<string[]>} Sorted array of district names
 *
 * @example
 * ```ts
 * const districts = await getDistricts('台北市');
 * console.log(districts); // ['大安區', '信義區', ...]
 * ```
 */
export async function getDistricts(city: string): Promise<string[]> {
  if (await isApiAvailable()) {
    try {
      return await getDistrictsApi(city);
    } catch (error) {
      console.warn('API districts fetch failed, falling back to local:', error);
    }
  }

  return getDistrictsLocal(city);
}

/**
 * Extracts districts from local data for a given city
 *
 * @param {string} city - City name to filter by
 * @returns {string[]} Sorted array of district names
 */
function getDistrictsLocal(city: string): string[] {
  const cityData = allLocalData.filter(land => land.sourceCity === city);
  const districts = Array.from(new Set(cityData.map(land => land.district)));
  return districts.sort();
}

// ==========================================
// Single Record Functions
// ==========================================

/**
 * Retrieves a single land record by its unique ID
 *
 * @param {string} id - Unique land identifier
 * @returns {Promise<UnclaimedLand | null>} Land record or null if not found
 *
 * @example
 * ```ts
 * const land = await getLandById('changhua-123');
 * if (land) {
 *   console.log(`Found: ${land.ownerName} - ${land.areaPing} ping`);
 * }
 * ```
 */
export async function getLandById(id: string): Promise<UnclaimedLand | null> {
  if (await isApiAvailable()) {
    try {
      return await getLandByIdApi(id);
    } catch (error) {
      console.warn('API getLandById failed, falling back to local:', error);
    }
  }

  return allLocalData.find(land => land.id === id) || null;
}

// ==========================================
// Statistics Functions
// ==========================================

/**
 * Retrieves statistical summary of the dataset
 *
 * Returns aggregated data including total lands, total area, and breakdown by city.
 *
 * @returns {Promise<StatisticsData>} Statistics including counts and areas
 *
 * @example
 * ```ts
 * const stats = await getStatistics();
 * console.log(`Total: ${stats.totalLands} lands, ${stats.totalAreaPing} ping`);
 * stats.byCity.forEach(city => {
 *   console.log(`${city.city}: ${city.count} lands`);
 * });
 * ```
 */
export async function getStatistics(): Promise<StatisticsData> {
  if (await isApiAvailable()) {
    try {
      return await getStatisticsApi();
    } catch (error) {
      console.warn('API stats fetch failed, falling back to local:', error);
    }
  }

  return getStatisticsLocal();
}

/**
 * Computes statistics from local data
 *
 * Calculates totals and aggregates by city from in-memory data.
 *
 * @returns {StatisticsData} Computed statistics
 */
function getStatisticsLocal(): StatisticsData {
  const totalLands = allLocalData.length;
  const totalAreaM2 = allLocalData.reduce((sum, land) => sum + land.areaM2, 0);
  const totalAreaPing = allLocalData.reduce((sum, land) => sum + land.areaPing, 0);

  const byCityMap: Record<string, { count: number; areaM2: number; areaPing: number }> = {};

  allLocalData.forEach(land => {
    if (!byCityMap[land.sourceCity]) {
      byCityMap[land.sourceCity] = { count: 0, areaM2: 0, areaPing: 0 };
    }
    byCityMap[land.sourceCity].count += 1;
    byCityMap[land.sourceCity].areaM2 += land.areaM2;
    byCityMap[land.sourceCity].areaPing += land.areaPing;
  });

  const byCity = Object.entries(byCityMap)
    .map(([city, stats]) => ({
      city,
      count: stats.count,
      areaM2: Math.round(stats.areaM2 * 100) / 100,
      areaPing: Math.round(stats.areaPing * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLands,
    totalAreaM2: Math.round(totalAreaM2 * 100) / 100,
    totalAreaPing: Math.round(totalAreaPing * 100) / 100,
    byCity,
    lastUpdated: new Date().toISOString(),
  };
}
