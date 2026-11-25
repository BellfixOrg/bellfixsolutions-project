import { NextResponse } from 'next/server';
import { getNavigationHierarchy } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Fresh navigation hierarchy on every request

export async function GET() {
  try {
    const hierarchy = await getNavigationHierarchy();
    return NextResponse.json(
      { success: true, data: hierarchy },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to get navigation hierarchy:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to get navigation' },
      { status: 500 }
    );
  }
}

