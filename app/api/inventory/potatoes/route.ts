import { NextResponse } from 'next/server';
import { loadServiceAccountCredentials, fetchCropInventory, buildFallback } from '../../../../lib/sheets';

const SHEET_ID = process.env.POTATOES_SHEET_ID || '';

export async function GET() {
  if (!SHEET_ID) {
    return NextResponse.json(buildFallback('Potatoes', 'not-configured'));
  }
  try {
    const credentials = loadServiceAccountCredentials();
    if (!credentials) {
      return NextResponse.json(buildFallback('Potatoes', SHEET_ID));
    }
    const data = await fetchCropInventory('Potatoes', SHEET_ID, credentials);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[potatoes] Error:', error);
    return NextResponse.json(buildFallback('Potatoes', SHEET_ID));
  }
}
