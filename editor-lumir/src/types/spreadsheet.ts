// Google Sheets 관련 타입 정의

export interface SpreadsheetOwner {
  displayName: string;
  emailAddress: string;
}

export interface Spreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
  createdTime: string;
  webViewLink: string;
  owners: SpreadsheetOwner[];
}

export interface SpreadsheetSearchParams {
  maxResults?: number;
  query?: string;
  modifiedAfter?: string;
  createdAfter?: string;
}

export interface SpreadsheetSearchResponse {
  success: boolean;
  data: Spreadsheet[];
  total: number;
  error?: string;
  details?: string;
}

// 스프레드시트 정렬 옵션
export type SpreadsheetSortField = 'modifiedTime' | 'createdTime' | 'name';
export type SpreadsheetSortDirection = 'asc' | 'desc';

export interface SpreadsheetSortOptions {
  field: SpreadsheetSortField;
  direction: SpreadsheetSortDirection;
}
