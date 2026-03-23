export interface Transaction {
  date: string;
  poNumber: string;
  incoming: number;
  outgoing: number;
  location: string; // was "field" — used for storage location or field
  runningBalance: number;
  notes: string;
  bolLink: string;
}

export interface SheetData {
  name: string;       // sheet tab name (variety / storage location)
  currentTotal: number;
  transactions: Transaction[];
}

export interface CropInventoryResponse {
  crop: string;
  sheetId: string;
  asOfDate: string;
  sheets: Record<string, SheetData>;
}
