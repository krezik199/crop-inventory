import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { CropInventoryResponse, SheetData, Transaction } from './types';

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export function loadServiceAccountCredentials(): ServiceAccountCredentials | null {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (credentialsJson) {
    try {
      return JSON.parse(credentialsJson);
    } catch (error) {
      console.error('[sheets] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', error);
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (email && privateKey) {
    return {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID || 'hyer-farms-inventory',
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
      private_key: privateKey,
      client_email: email,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: '',
    };
  }

  const possiblePaths = [
    path.join(process.cwd(), '..', '..', 'credentials', 'google_service_account.json'),
    path.join(process.cwd(), 'google_service_account.json'),
  ];
  for (const credPath of possiblePaths) {
    if (fs.existsSync(credPath)) {
      try {
        return JSON.parse(fs.readFileSync(credPath, 'utf-8'));
      } catch {}
    }
  }

  return null;
}

export async function fetchCropInventory(
  cropName: string,
  sheetId: string,
  credentials: ServiceAccountCredentials,
  // Optional: exclude certain sheet tab names
  excludePatterns: RegExp[] = [/^_/, /^README$/i, /^Reference$/i, /^Temp/i, /^Summary$/i]
): Promise<CropInventoryResponse> {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials as any,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Discover sheet tabs
  const metadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const allSheets = metadata.data.sheets || [];
  const tabNames = allSheets
    .map((s: any) => s.properties?.title as string)
    .filter((title: string) => {
      if (!title) return false;
      return !excludePatterns.some((p) => p.test(title));
    });

  const sheetsData: Record<string, SheetData> = {};

  for (const tabName of tabNames) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!A:H`,
      });
      const rows = response.data.values || [];

      // Row 0 = title/name row, Row 1 = column headers, Row 2+ = data
      const transactions: Transaction[] = [];
      let totalIncoming = 0;
      let totalOutgoing = 0;

      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const date = (row[0] as string)?.trim() || '';
        if (!date) continue;
        const poNumber = (row[1] as string)?.trim() || '';
        const incoming = parseFloat(row[2] as any) || 0;
        const outgoing = parseFloat(row[3] as any) || 0;
        const location = (row[4] as string)?.trim() || '';
        const runningBalance = parseFloat(row[5] as any) || 0;
        const notes = (row[6] as string)?.trim() || '';
        const bolLink = (row[7] as string)?.trim() || '';
        transactions.push({ date, poNumber, incoming, outgoing, location, runningBalance, notes, bolLink });
        totalIncoming += incoming;
        totalOutgoing += outgoing;
      }

      sheetsData[tabName] = {
        name: tabName,
        currentTotal: totalIncoming - totalOutgoing,
        transactions,
      };
    } catch (err) {
      console.warn(`[sheets] Failed to fetch tab "${tabName}":`, err);
      sheetsData[tabName] = { name: tabName, currentTotal: 0, transactions: [] };
    }
  }

  return {
    crop: cropName,
    sheetId,
    asOfDate: new Date().toISOString(),
    sheets: sheetsData,
  };
}

export function buildFallback(cropName: string, sheetId: string): CropInventoryResponse {
  return {
    crop: cropName,
    sheetId,
    asOfDate: new Date().toISOString(),
    sheets: {},
  };
}
