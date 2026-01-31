/**
 * API Client for Heritage Hunter
 * Provides methods to fetch data from the backend API
 */

import type { UnclaimedLand, SearchFilters, SearchResult, StatisticsData, CityData } from './types';

const API_BASE = '/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: string;
    pagination?: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

/**
 * Checks if the backend API is reachable and healthy
 *
 * Performs a quick health check by attempting to fetch statistics endpoint.
 * Does not throw errors; returns false on any failure.
 *
 * @returns {Promise<boolean>} True if API responds successfully, false otherwise
 *
 * @example
 * ```ts
 * const isOnline = await checkApiHealth();
 * if (isOnline) {
 *   console.log('API is available');
 * } else {
 *   console.log('Falling back to local data');
 * }
 * ```
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/stats`, {
            method: 'GET',
            cache: 'no-store',
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Searches lands via the API endpoint with filters and pagination
 *
 * Throws on API errors. Use data-loader.ts searchLands() for automatic fallback.
 *
 * @param {SearchFilters} filters - Search filters (query, city, district)
 * @param {number} [limit=50] - Maximum results per page
 * @param {number} [offset=0] - Starting offset for pagination
 * @returns {Promise<SearchResult>} Search results with pagination metadata
 * @throws {Error} On API errors or network failures
 *
 * @example
 * ```ts
 * try {
 *   const result = await searchLandsApi(
 *     { city: '台北市', query: '公園' },
 *     50,
 *     0
 *   );
 *   console.log(`Found ${result.pagination.total} results`);
 * } catch (error) {
 *   console.error('API error:', error.message);
 * }
 * ```
 */
export async function searchLandsApi(
    filters: SearchFilters,
    limit = 50,
    offset = 0
): Promise<SearchResult> {
    const params = new URLSearchParams();

    if (filters.query) params.set('query', filters.query);
    if (filters.city) params.set('city', filters.city);
    if (filters.district) params.set('district', filters.district);
    params.set('limit', String(limit));
    params.set('offset', String(offset));

    const response = await fetch(`${API_BASE}/lands?${params.toString()}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const json: ApiResponse<UnclaimedLand[]> = await response.json();

    if (!json.success) {
        throw new Error(json.error || 'Unknown error');
    }

    return {
        data: json.data || [],
        pagination: json.pagination || { total: 0, limit, offset, hasMore: false },
    };
}

/**
 * Fetches a single land record by its unique ID
 *
 * @param {string} id - Unique land identifier
 * @returns {Promise<UnclaimedLand | null>} Land record or null if not found
 * @throws {Error} On API errors (except 404)
 *
 * @example
 * ```ts
 * const land = await getLandByIdApi('changhua-123');
 * if (land) {
 *   console.log(`Owner: ${land.ownerName}`);
 * } else {
 *   console.log('Land not found');
 * }
 * ```
 */
export async function getLandByIdApi(id: string): Promise<UnclaimedLand | null> {
    const response = await fetch(`${API_BASE}/lands/${id}`, {
        cache: 'no-store',
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const json: ApiResponse<UnclaimedLand> = await response.json();
    return json.data || null;
}

/**
 * Retrieves all cities with their districts from the API
 *
 * @returns {Promise<CityData[]>} Array of cities with sorted districts
 * @throws {Error} On API errors or network failures
 *
 * @example
 * ```ts
 * const cities = await getCitiesApi();
 * cities.forEach(city => {
 *   console.log(`${city.city}: ${city.districts.join(', ')}`);
 * });
 * ```
 */
export async function getCitiesApi(): Promise<CityData[]> {
    const response = await fetch(`${API_BASE}/cities`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const json: ApiResponse<CityData[]> = await response.json();
    return json.data || [];
}

/**
 * Retrieves districts for a specific city from the API
 *
 * @param {string} city - City name to get districts for
 * @returns {Promise<string[]>} Sorted array of district names
 * @throws {Error} On API errors or network failures
 *
 * @example
 * ```ts
 * const districts = await getDistrictsApi('台北市');
 * console.log(districts); // ['大安區', '信義區', ...]
 * ```
 */
export async function getDistrictsApi(city: string): Promise<string[]> {
    const response = await fetch(`${API_BASE}/cities?city=${encodeURIComponent(city)}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const json: ApiResponse<{ city: string; districts: string[] }> = await response.json();
    return json.data?.districts || [];
}

/**
 * Retrieves statistical summary from the API
 *
 * Returns aggregated data including total lands, areas, and breakdown by city.
 *
 * @returns {Promise<StatisticsData>} Statistics with counts and areas
 * @throws {Error} On API errors, network failures, or missing data
 *
 * @example
 * ```ts
 * try {
 *   const stats = await getStatisticsApi();
 *   console.log(`Total lands: ${stats.totalLands}`);
 *   console.log(`Total area: ${stats.totalAreaPing} ping`);
 * } catch (error) {
 *   console.error('Failed to load stats:', error);
 * }
 * ```
 */
export async function getStatisticsApi(): Promise<StatisticsData> {
    const response = await fetch(`${API_BASE}/stats`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const json: ApiResponse<StatisticsData> = await response.json();

    if (!json.data) {
        throw new Error('No statistics data returned');
    }

    return json.data;
}
