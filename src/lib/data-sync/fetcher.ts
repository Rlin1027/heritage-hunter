import Papa from 'papaparse';

export interface FetchResult {
  success: boolean;
  data?: string;
  error?: string;
  recordCount?: number;
}

export class DataFetcher {
  private static readonly DATA_GOV_BASE = 'https://data.gov.tw/api/v2/rest/datastore';
  private static readonly TAIPEI_API_BASE = 'https://data.taipei/api/v1/dataset';

  /**
   * Fetch CSV data from data.gov.tw
   */
  static async fetchFromDataGov(datasetId: string): Promise<FetchResult> {
    try {
      // data.gov.tw API returns JSON with resource info
      const metaUrl = `https://data.gov.tw/api/v2/rest/dataset/${datasetId}`;
      const metaResponse = await fetch(metaUrl);

      if (!metaResponse.ok) {
        return { success: false, error: `Failed to fetch metadata: ${metaResponse.status}` };
      }

      const meta = await metaResponse.json();
      const csvResource = meta.resources?.find((r: any) =>
        r.format?.toLowerCase() === 'csv' || r.resourceFormat?.toLowerCase() === 'csv'
      );

      if (!csvResource?.resourceDownloadUrl) {
        return { success: false, error: 'No CSV resource found in dataset' };
      }

      const csvResponse = await fetch(csvResource.resourceDownloadUrl);
      if (!csvResponse.ok) {
        return { success: false, error: `Failed to fetch CSV: ${csvResponse.status}` };
      }

      const csvData = await csvResponse.text();
      const parsed = Papa.parse(csvData, { header: true });

      return {
        success: true,
        data: csvData,
        recordCount: parsed.data.length,
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Fetch CSV data from data.taipei
   */
  static async fetchFromTaipei(datasetId: string): Promise<FetchResult> {
    try {
      // Taipei API has pagination, we need to get all records
      const limit = 1000;
      let offset = 0;
      let allRecords: any[] = [];

      while (true) {
        const url = `${this.TAIPEI_API_BASE}/${datasetId}?scope=resourceAquire&limit=${limit}&offset=${offset}`;
        const response = await fetch(url);

        if (!response.ok) {
          return { success: false, error: `Failed to fetch: ${response.status}` };
        }

        const json = await response.json();
        const records = json.result?.results || [];

        if (records.length === 0) break;

        allRecords = allRecords.concat(records);
        offset += limit;

        // Safety limit
        if (allRecords.length > 100000) break;
      }

      // Convert JSON to CSV format for uniform processing
      if (allRecords.length === 0) {
        return { success: false, error: 'No records found' };
      }

      const csvData = Papa.unparse(allRecords);

      return {
        success: true,
        data: csvData,
        recordCount: allRecords.length,
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
