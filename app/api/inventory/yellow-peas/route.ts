import { NextResponse } from 'next/server';
import { loadServiceAccountCredentials, fetchCropInventory, buildFallback } from '../../../../lib/sheets';

const SHEET_ID = process.env.YELLOW_PEAS_SHEET_ID || '';

export async function GET() {
  if (!SHEET_ID) {
    return NextResponse.json(buildFallback('Yellow Peas', 'not-configured'));
  }
  try {
    const credentials = loadServiceAccountCredentials();
    if (!credentials) {
      return NextResponse.json(buildFallback('Yellow Peas', SHEET_ID));
    }
    const data = await fetchCropInventory('Yellow Peas', SHEET_ID, credentials);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[yellow-peas] Error:', error);
    return NextResponse.json(buildFallback('Yellow Peas', SHEET_ID));
  }
}
