// Base parser interface for all city parsers

export interface RawLandData {
  sourceCity: string;
  district: string;
  section?: string;
  landNumber: string;
  ownerName?: string;
  areaM2?: number;
  areaPing?: number;
  status?: string;
  rawData?: Record<string, unknown>;
}

export interface BaseParser {
  cityName: string;
  datasetId: string;
  apiUrl: string;

  parse(csvData: string): RawLandData[];
  getApiUrl(): string;
}

export abstract class AbstractParser implements BaseParser {
  abstract cityName: string;
  abstract datasetId: string;
  abstract apiUrl: string;

  abstract parse(csvData: string): RawLandData[];

  getApiUrl(): string {
    return this.apiUrl;
  }

  // Helper to convert 平方公尺 to 坪
  protected m2ToPing(m2: number): number {
    return Number((m2 / 3.30579).toFixed(2));
  }

  // Helper to clean owner name (remove extra spaces, etc.)
  protected cleanOwnerName(name: string | undefined): string | undefined {
    if (!name) return undefined;
    return name.trim().replace(/\s+/g, '');
  }

  // Helper to parse area string to number
  protected parseArea(areaStr: string | undefined): number | undefined {
    if (!areaStr) return undefined;
    const num = parseFloat(areaStr.replace(/,/g, ''));
    return isNaN(num) ? undefined : num;
  }
}
