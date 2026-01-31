'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { searchLands, getCities, getStatistics, getDataSource } from '@/lib/data-loader';
import type { UnclaimedLand, SearchFilters, StatisticsData, CityData } from '@/lib/types';

/**
 * Debounces a value to reduce frequent updates
 *
 * @template T - Type of the value to debounce
 * @param {T} value - The value to debounce
 * @param {number} [delay=300] - Delay in milliseconds before updating
 * @returns {T} The debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // This will only run 500ms after user stops typing
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface UseSearchResult {
    results: UnclaimedLand[];
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;
    search: (filters: SearchFilters) => Promise<void>;
    loadMore: () => Promise<void>;
    reset: () => void;
}

/**
 * Manages land search with pagination and filtering
 *
 * @param {number} [initialPageSize=50] - Number of results per page
 * @returns {UseSearchResult} Search state and control functions
 *
 * @example
 * ```tsx
 * const { results, loading, search, loadMore, hasMore } = useSearch(50);
 *
 * // Perform search
 * await search({ city: '台北市', query: '公園' });
 *
 * // Load more results
 * if (hasMore) {
 *   await loadMore();
 * }
 * ```
 */
export function useSearch(initialPageSize = 50): UseSearchResult {
    const [results, setResults] = useState<UnclaimedLand[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
    const [offset, setOffset] = useState(0);

    // Use ref to always have the latest filters in loadMore
    const filtersRef = useRef<SearchFilters>({});
    const offsetRef = useRef(0);

    const search = useCallback(async (filters: SearchFilters) => {
        setLoading(true);
        setError(null);
        setCurrentFilters(filters);
        filtersRef.current = filters;
        setOffset(0);
        offsetRef.current = 0;

        try {
            const result = await searchLands(filters, initialPageSize, 0);
            setResults(result.data);
            setTotal(result.pagination.total);
            setHasMore(result.pagination.hasMore);
            setOffset(initialPageSize);
            offsetRef.current = initialPageSize;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setResults([]);
            setTotal(0);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [initialPageSize]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            // Use ref to get the latest filters and offset
            const result = await searchLands(filtersRef.current, initialPageSize, offsetRef.current);
            setResults(prev => [...prev, ...result.data]);
            setHasMore(result.pagination.hasMore);
            const newOffset = offsetRef.current + initialPageSize;
            setOffset(newOffset);
            offsetRef.current = newOffset;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Load more failed');
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, initialPageSize]);

    const reset = useCallback(() => {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        setOffset(0);
        offsetRef.current = 0;
        setError(null);
        setCurrentFilters({});
        filtersRef.current = {};
    }, []);

    return { results, loading, error, total, hasMore, search, loadMore, reset };
}

interface UseCitiesResult {
    cities: CityData[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Loads available cities and their districts
 *
 * @returns {UseCitiesResult} Cities data, loading state, and refresh function
 *
 * @example
 * ```tsx
 * const { cities, loading, error, refresh } = useCities();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return cities.map(city => (
 *   <div key={city.city}>
 *     {city.city}: {city.districts.join(', ')}
 *   </div>
 * ));
 * ```
 */
export function useCities(): UseCitiesResult {
    const [cities, setCities] = useState<CityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCities();
            setCities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cities');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { cities, loading, error, refresh };
}

interface UseStatisticsResult {
    stats: StatisticsData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Loads statistical data about unclaimed lands
 *
 * @returns {UseStatisticsResult} Statistics data, loading state, and refresh function
 *
 * @example
 * ```tsx
 * const { stats, loading, error } = useStatistics();
 *
 * if (stats) {
 *   console.log(`Total lands: ${stats.totalLands}`);
 *   console.log(`Total area: ${stats.totalAreaPing} ping`);
 * }
 * ```
 */
export function useStatistics(): UseStatisticsResult {
    const [stats, setStats] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getStatistics();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { stats, loading, error, refresh };
}

interface UseDataSourceResult {
    source: 'api' | 'local' | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

/**
 * Checks whether data is loaded from API or local sources
 *
 * @returns {UseDataSourceResult} Data source type ('api' or 'local'), loading state, and refresh function
 *
 * @example
 * ```tsx
 * const { source, loading } = useDataSource();
 *
 * if (!loading) {
 *   console.log(source === 'api' ? 'Using live API' : 'Using local data');
 * }
 * ```
 */
export function useDataSource(): UseDataSourceResult {
    const [source, setSource] = useState<'api' | 'local' | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getDataSource();
            setSource(result);
        } catch {
            setSource('local');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { source, loading, refresh };
}
