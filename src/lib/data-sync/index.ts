// Data Sync Module - 統一匯出
export { DataFetcher } from './fetcher';
export { normalizeData, type NormalizedLand } from './normalizer';
export { TaipeiParser } from './parsers/taipei';
export { ChiayiParser } from './parsers/chiayi';
export { ChanghuaParser } from './parsers/changhua';
export type { BaseParser, RawLandData } from './parsers/base';
