// District coordinates for Taiwan cities (realistic lat/lng)

export const districtCoordinates: Record<string, { lat: number; lng: number }> = {
  // Changhua County (彰化縣)
  '彰化市': { lat: 24.0751, lng: 120.5438 },
  '員林市': { lat: 23.9589, lng: 120.5747 },
  '鹿港鎮': { lat: 24.0557, lng: 120.4342 },
  '和美鎮': { lat: 24.1100, lng: 120.4981 },
  '北斗鎮': { lat: 23.8708, lng: 120.5219 },
  '溪湖鎮': { lat: 23.9595, lng: 120.4814 },
  '田中鎮': { lat: 23.8600, lng: 120.5872 },
  '二林鎮': { lat: 23.9253, lng: 120.4089 },

  // Chiayi City (嘉義市)
  '東區': { lat: 23.4800, lng: 120.4558 },
  '西區': { lat: 23.4694, lng: 120.4394 },

  // Taipei City (台北市)
  '中正區': { lat: 25.0320, lng: 121.5148 },
  '大同區': { lat: 25.0632, lng: 121.5138 },
  '中山區': { lat: 25.0636, lng: 121.5330 },
  '松山區': { lat: 25.0497, lng: 121.5578 },
  '大安區': { lat: 25.0263, lng: 121.5436 },
  '萬華區': { lat: 25.0324, lng: 121.4990 },
  '信義區': { lat: 25.0330, lng: 121.5654 },
  '士林區': { lat: 25.0876, lng: 121.5157 },
  '北投區': { lat: 25.1315, lng: 121.5011 },
  '內湖區': { lat: 25.0826, lng: 121.5899 },
  '南港區': { lat: 25.0558, lng: 121.6072 },
  '文山區': { lat: 24.9889, lng: 121.5707 },

  // New Taipei City (新北市)
  '板橋區': { lat: 25.0092, lng: 121.4591 },
  '新莊區': { lat: 25.0364, lng: 121.4325 },
  '中和區': { lat: 24.9994, lng: 121.4993 },
  '永和區': { lat: 25.0077, lng: 121.5159 },
  '土城區': { lat: 24.9728, lng: 121.4420 },
  '三重區': { lat: 25.0619, lng: 121.4883 },
  '蘆洲區': { lat: 25.0840, lng: 121.4741 },
  '樹林區': { lat: 24.9938, lng: 121.4201 },
  '鶯歌區': { lat: 24.9546, lng: 121.3541 },
  '三峽區': { lat: 24.9345, lng: 121.3692 },
  '淡水區': { lat: 25.1677, lng: 121.4407 },
  '汐止區': { lat: 25.0673, lng: 121.6423 },
  '瑞芳區': { lat: 25.1093, lng: 121.8118 },
  '新店區': { lat: 24.9674, lng: 121.5414 },
};

export function getDistrictCoords(district: string): { lat: number; lng: number } | undefined {
  return districtCoordinates[district];
}

export function addRandomOffset(coords: { lat: number; lng: number }): { lat: number; lng: number } {
  // Add small random offset to simulate different locations within district
  const latOffset = (Math.random() - 0.5) * 0.02; // ~1km variation
  const lngOffset = (Math.random() - 0.5) * 0.02;

  return {
    lat: parseFloat((coords.lat + latOffset).toFixed(6)),
    lng: parseFloat((coords.lng + lngOffset).toFixed(6))
  };
}
