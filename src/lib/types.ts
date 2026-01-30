export interface UnclaimedLand {
  id: string;
  sourceCity: 'Changhua' | 'Chiayi' | 'Taipei' | 'NewTaipei';
  district: string;
  section: string;
  landNumber: string;
  ownerName: string;
  areaM2: number;
  areaPing: number;
  status: string;
  coordinates?: { lat: number; lng: number; };
}

export interface SearchFilters {
  city?: UnclaimedLand['sourceCity'];
  district?: string;
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
