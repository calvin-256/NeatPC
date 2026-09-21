// ===========================================
// NeatPC — Price Sync Cron Job
// ===========================================
// Triggered by Vercel Cron every 6 hours.
// Will be implemented in Phase 2 (Commit 18).
// For now, returns a placeholder response.

import { NextResponse } from 'next/server';
import { syncAllPrices } from '@/lib/retailers/sync';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (in production)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await syncAllPrices();

    return NextResponse.json({
      success: true,
      message: 'Price sync completed successfully',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron price sync failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
