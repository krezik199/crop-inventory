import { NextResponse } from 'next/server';
import { loadServiceAccountCredentials, fetchCropInventory, buildFallback } from '../../../../lib/sheets';

const SHEET_ID = process.env.ONIONS_SHEET_ID || '';

export async function GET() {
  if (!SHEET_ID) {
    return NextResponse.json(buildFallback('Onions', 'not-configured'));
  }
  try {
    const credentials = loadServiceAccountCredentials();
    if (!credentials) {
      return NextResponse.json(buildFallback('Onions', SHEET_ID));
    }
    const data = await fetchCropInventory('Onions', SHEET_ID, credentials);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[onions] Error:', error);
    return NextResponse.json(buildFallback('Onions', SHEET_ID));
  }
}
