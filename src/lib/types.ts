// Base land interface (compatible with both API and local data)
export interface UnclaimedLand {
  id: string;
  sourceCity: string;
  district: string;
  section: string;
  landNumber: string;
  ownerName: string;
  areaM2: number;
  areaPing: number;
  status: string;
  coordinates?: { lat: number; lng: number } | null;
}

export interface SearchFilters {
  city?: string;
  district?: string;
  query?: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SearchResult {
  data: UnclaimedLand[];
  pagination: PaginationInfo;
}

export interface StatisticsData {
  totalLands: number;
  totalAreaM2: number;
  totalAreaPing: number;
  byCity: Array<{
    city: string;
    count: number;
    areaM2: number;
    areaPing: number;
    lastSynced?: string;
    status?: string;
  }>;
  lastUpdated: string;
}

export interface CityData {
  city: string;
  districts: string[];
}

export type ThemeType = 'cyberpunk' | 'indiana';

export interface ThemeConfig {
  name: string;
  colors: {
    background: string;
    primary: string;
    accent: string;
    text: string;
    card: string;
  };
}
