import type { UnclaimedLand } from './types';

const surnames = ['林', '陳', '王', '李', '張', '黃', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '郭', '洪'];
const taipeiDistricts = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];
const newTaipeiDistricts = ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '汐止區', '樹林區', '淡水區', '三峽區'];

const taipeiCoords: Record<string, { lat: number; lng: number }> = {
  '中正區': { lat: 25.0324, lng: 121.5199 },
  '大同區': { lat: 25.0633, lng: 121.5130 },
  '中山區': { lat: 25.0693, lng: 121.5337 },
  '松山區': { lat: 25.0497, lng: 121.5577 },
  '大安區': { lat: 25.0268, lng: 121.5436 },
  '萬華區': { lat: 25.0342, lng: 121.4997 },
  '信義區': { lat: 25.0305, lng: 121.5718 },
  '士林區': { lat: 25.0927, lng: 121.5246 },
  '北投區': { lat: 25.1316, lng: 121.5015 },
  '內湖區': { lat: 25.0697, lng: 121.5883 },
  '南港區': { lat: 25.0305, lng: 121.6062 },
  '文山區': { lat: 24.9893, lng: 121.5705 },
};

const newTaipeiCoords: Record<string, { lat: number; lng: number }> = {
  '板橋區': { lat: 25.0148, lng: 121.4592 },
  '三重區': { lat: 25.0617, lng: 121.4875 },
  '中和區': { lat: 24.9996, lng: 121.4986 },
  '永和區': { lat: 25.0076, lng: 121.5163 },
  '新莊區': { lat: 25.0357, lng: 121.4503 },
  '新店區': { lat: 24.9675, lng: 121.5417 },
  '土城區': { lat: 24.9723, lng: 121.4432 },
  '蘆洲區': { lat: 25.0848, lng: 121.4732 },
  '汐止區': { lat: 25.0657, lng: 121.6571 },
  '樹林區': { lat: 24.9903, lng: 121.4205 },
  '淡水區': { lat: 25.1697, lng: 121.4416 },
  '三峽區': { lat: 24.9342, lng: 121.3687 },
};

const sections = ['一段', '二段', '三段', '四段', '五段'];
const statuses = ['列管中', '即將拍賣', '公告期間'];

function randomOffset(base: number, range: number): number {
  return base + (Math.random() - 0.5) * range;
}

function generateLandNumber(): string {
  const main = String(Math.floor(Math.random() * 2000)).padStart(4, '0');
  const sub = String(Math.floor(Math.random() * 100)).padStart(4, '0');
  return `${main}-${sub}`;
}

function generateName(): string {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const chars = Math.random() > 0.3 ? 2 : 1;
  return surname + 'O'.repeat(chars);
}

export const mockLandData: UnclaimedLand[] = Array.from({ length: 80 }, (_, i) => {
  const isTaipei = Math.random() > 0.5;
  const districts = isTaipei ? taipeiDistricts : newTaipeiDistricts;
  const coords = isTaipei ? taipeiCoords : newTaipeiCoords;
  const district = districts[Math.floor(Math.random() * districts.length)];
  const baseCoord = coords[district];
  const areaM2 = Math.floor(Math.random() * 490) + 10;

  return {
    id: `land-${i + 1}`,
    sourceCity: isTaipei ? 'Taipei' : 'NewTaipei',
    district,
    section: `${district.slice(0, 2)}${sections[Math.floor(Math.random() * sections.length)]}`,
    landNumber: generateLandNumber(),
    ownerName: generateName(),
    areaM2,
    areaPing: areaM2 * 0.3025,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    coordinates: {
      lat: randomOffset(baseCoord.lat, 0.02),
      lng: randomOffset(baseCoord.lng, 0.02),
    },
  };
});

export function searchLands(query: string, filters?: { city?: UnclaimedLand['sourceCity']; district?: string }): UnclaimedLand[] {
  return mockLandData.filter(land => {
    const matchesQuery = !query || land.ownerName.includes(query) || land.district.includes(query);
    const matchesCity = !filters?.city || land.sourceCity === filters.city;
    const matchesDistrict = !filters?.district || land.district.includes(filters.district);
    return matchesQuery && matchesCity && matchesDistrict;
  });
}
