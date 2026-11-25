import { NextResponse } from 'next/server';
import { getNavigationHierarchy } from '@/lib/db';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const hierarchy = await getNavigationHierarchy();
    return NextResponse.json({ success: true, data: hierarchy });
  } catch (error: any) {
    console.error('Failed to get navigation hierarchy:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to get navigation' },
      { status: 500 }
    );
  }
}

