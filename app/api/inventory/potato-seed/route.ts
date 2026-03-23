import { NextResponse } from 'next/server';
import { loadServiceAccountCredentials, fetchCropInventory, buildFallback } from '../../../../lib/sheets';

const SHEET_ID = process.env.POTATO_SEED_SHEET_ID || process.env.GOOGLE_SHEET_ID || '1kPeDkiKZIY5I6Z8VFVQvqaRVOmw3uLNAmrIEjDSv2gw';

export async function GET() {
  try {
    const credentials = loadServiceAccountCredentials();
    if (!credentials) {
      return NextResponse.json(buildFallback('Potato Seed', SHEET_ID));
    }
    const data = await fetchCropInventory('Potato Seed', SHEET_ID, credentials);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[potato-seed] Error:', error);
    return NextResponse.json(buildFallback('Potato Seed', SHEET_ID));
  }
}
