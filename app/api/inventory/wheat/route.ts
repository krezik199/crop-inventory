import { NextResponse } from 'next/server';
import { loadServiceAccountCredentials, fetchCropInventory, buildFallback } from '../../../../lib/sheets';

const SHEET_ID = process.env.WHEAT_SHEET_ID || '';

export async function GET() {
  if (!SHEET_ID) {
    return NextResponse.json(buildFallback('Wheat', 'not-configured'));
  }
  try {
    const credentials = loadServiceAccountCredentials();
    if (!credentials) {
      return NextResponse.json(buildFallback('Wheat', SHEET_ID));
    }
    const data = await fetchCropInventory('Wheat', SHEET_ID, credentials);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[wheat] Error:', error);
    return NextResponse.json(buildFallback('Wheat', SHEET_ID));
  }
}
