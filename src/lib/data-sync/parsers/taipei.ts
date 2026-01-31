import Papa from 'papaparse';
import { AbstractParser, RawLandData } from './base';

// 台北市未辦繼承登記土地資料欄位
interface TaipeiRawRecord {
  被繼承人姓名?: string;
  土地區段?: string;
  地段?: string;
  地號?: string;
  面積?: string;
  列管情形?: string;
  [key: string]: string | undefined;
}

export class TaipeiParser extends AbstractParser {
  cityName = '台北市';
  datasetId = '134972';
  apiUrl = 'https://data.taipei/api/v1/dataset/134972';

  parse(csvData: string): RawLandData[] {
    const result = Papa.parse<TaipeiRawRecord>(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data
      .filter(row => row.被繼承人姓名 || row.地號)
      .map((row, index) => ({
        sourceCity: this.cityName,
        district: row.土地區段 || '未知區',
        section: row.地段,
        landNumber: row.地號 || `unknown-${index}`,
        ownerName: this.cleanOwnerName(row.被繼承人姓名),
        areaM2: this.parseArea(row.面積),
        areaPing: this.parseArea(row.面積) ? this.m2ToPing(this.parseArea(row.面積)!) : undefined,
        status: row.列管情形 || '列管中',
        rawData: row as Record<string, unknown>,
      }));
  }
}
