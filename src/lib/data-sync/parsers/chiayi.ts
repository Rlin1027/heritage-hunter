import Papa from 'papaparse';
import { AbstractParser, RawLandData } from './base';

// 嘉義市/縣未辦繼承登記土地資料欄位 (可能有差異)
interface ChiayiRawRecord {
  被繼承人?: string;
  姓名?: string;
  區域?: string;
  鄉鎮市區?: string;
  地段?: string;
  段?: string;
  地號?: string;
  小段?: string;
  面積?: string;
  土地面積?: string;
  管理情形?: string;
  [key: string]: string | undefined;
}

export class ChiayiParser extends AbstractParser {
  cityName: string;
  datasetId: string;
  apiUrl: string;

  constructor(isCounty: boolean = false) {
    super();
    if (isCounty) {
      this.cityName = '嘉義縣';
      this.datasetId = '133739';
      this.apiUrl = 'https://data.gov.tw/dataset/133739';
    } else {
      this.cityName = '嘉義市';
      this.datasetId = '52344';
      this.apiUrl = 'https://data.gov.tw/dataset/52344';
    }
  }

  parse(csvData: string): RawLandData[] {
    const result = Papa.parse<ChiayiRawRecord>(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data
      .filter(row => row.被繼承人 || row.姓名 || row.地號)
      .map((row, index) => {
        const ownerName = row.被繼承人 || row.姓名;
        const district = row.區域 || row.鄉鎮市區 || '未知區';
        const section = row.地段 || row.段;
        const landNumber = row.地號 || (row.小段 ? `${row.小段}` : `unknown-${index}`);
        const areaStr = row.面積 || row.土地面積;
        const areaM2 = this.parseArea(areaStr);

        return {
          sourceCity: this.cityName,
          district,
          section,
          landNumber,
          ownerName: this.cleanOwnerName(ownerName),
          areaM2,
          areaPing: areaM2 ? this.m2ToPing(areaM2) : undefined,
          status: row.管理情形 || '列管中',
          rawData: row as Record<string, unknown>,
        };
      });
  }
}
