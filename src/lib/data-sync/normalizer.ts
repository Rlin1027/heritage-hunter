import { RawLandData } from './parsers/base';

export interface NormalizedLand {
  sourceCity: string;
  district: string;
  section: string | null;
  landNumber: string;
  ownerName: string | null;
  areaM2: number | null;
  areaPing: number | null;
  status: string;
  coordinates: { lat: number; lng: number } | null;
  rawData: Record<string, unknown> | null;
  sourceUrl: string | null;
}

// 縣市名稱標準化對照表
const CITY_NAME_MAP: Record<string, string> = {
  '台北市': '台北市',
  '臺北市': '台北市',
  'Taipei': '台北市',
  '新北市': '新北市',
  'NewTaipei': '新北市',
  '嘉義市': '嘉義市',
  '嘉義縣': '嘉義縣',
  '彰化縣': '彰化縣',
};

// 區域中心點座標 (當無法 geocode 時使用)
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  // 台北市
  '中正區': { lat: 25.0324, lng: 121.5198 },
  '大同區': { lat: 25.0656, lng: 121.5130 },
  '中山區': { lat: 25.0648, lng: 121.5332 },
  '松山區': { lat: 25.0607, lng: 121.5579 },
  '大安區': { lat: 25.0268, lng: 121.5435 },
  '萬華區': { lat: 25.0319, lng: 121.4970 },
  '信義區': { lat: 25.0306, lng: 121.5675 },
  '士林區': { lat: 25.0929, lng: 121.5198 },
  '北投區': { lat: 25.1320, lng: 121.5010 },
  '內湖區': { lat: 25.0697, lng: 121.5883 },
  '南港區': { lat: 25.0547, lng: 121.6069 },
  '文山區': { lat: 24.9984, lng: 121.5706 },
  // 嘉義市
  '東區': { lat: 23.4870, lng: 120.4580 },
  '西區': { lat: 23.4750, lng: 120.4310 },
  // 彰化縣
  '彰化市': { lat: 24.0815, lng: 120.5382 },
  '員林市': { lat: 23.9588, lng: 120.5742 },
  '鹿港鎮': { lat: 24.0568, lng: 120.4356 },
};

/**
 * Normalize raw land data to database format
 */
export function normalizeData(rawData: RawLandData[], sourceUrl?: string): NormalizedLand[] {
  return rawData.map(data => {
    const normalizedCity = CITY_NAME_MAP[data.sourceCity] || data.sourceCity;
    const coords = getCoordinatesForDistrict(normalizedCity, data.district);

    return {
      sourceCity: normalizedCity,
      district: data.district,
      section: data.section || null,
      landNumber: data.landNumber,
      ownerName: data.ownerName || null,
      areaM2: data.areaM2 || null,
      areaPing: data.areaPing || (data.areaM2 ? Number((data.areaM2 / 3.30579).toFixed(2)) : null),
      status: data.status || '列管中',
      coordinates: coords,
      rawData: data.rawData || null,
      sourceUrl: sourceUrl || null,
    };
  });
}

/**
 * Get approximate coordinates for a district
 */
function getCoordinatesForDistrict(
  city: string,
  district: string
): { lat: number; lng: number } | null {
  // First try exact match
  if (DISTRICT_COORDS[district]) {
    return DISTRICT_COORDS[district];
  }

  // Try with city prefix removed
  const cleanDistrict = district.replace(/^(台北市|臺北市|新北市|嘉義市|嘉義縣|彰化縣)/, '');
  if (DISTRICT_COORDS[cleanDistrict]) {
    return DISTRICT_COORDS[cleanDistrict];
  }

  // Return city center as fallback
  const cityCenters: Record<string, { lat: number; lng: number }> = {
    '台北市': { lat: 25.0330, lng: 121.5654 },
    '嘉義市': { lat: 23.4801, lng: 120.4491 },
    '嘉義縣': { lat: 23.4518, lng: 120.2555 },
    '彰化縣': { lat: 24.0518, lng: 120.5161 },
  };

  return cityCenters[city] || null;
}
