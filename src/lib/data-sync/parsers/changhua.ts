import Papa from 'papaparse';
import { AbstractParser, RawLandData } from './base';

// 彰化縣未辦繼承登記土地資料欄位
interface ChanghuaRawRecord {
  被繼承人姓名?: string;
  鄉鎮市區?: string;
  地段?: string;
  地號?: string;
  面積?: string;
  公告現值?: string;
  列管情形?: string;
  [key: string]: string | undefined;
}

export class ChanghuaParser extends AbstractParser {
  cityName = '彰化縣';
  datasetId = '28529';
  apiUrl = 'https://data.gov.tw/dataset/28529';

  parse(csvData: string): RawLandData[] {
    const result = Papa.parse<ChanghuaRawRecord>(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data
      .filter(row => row.被繼承人姓名 || row.地號)
      .map((row, index) => {
        const areaM2 = this.parseArea(row.面積);

        return {
          sourceCity: this.cityName,
          district: row.鄉鎮市區 || '未知區',
          section: row.地段,
          landNumber: row.地號 || `unknown-${index}`,
          ownerName: this.cleanOwnerName(row.被繼承人姓名),
          areaM2,
          areaPing: areaM2 ? this.m2ToPing(areaM2) : undefined,
          status: row.列管情形 || '列管中',
          rawData: row as Record<string, unknown>,
        };
      });
  }
}
