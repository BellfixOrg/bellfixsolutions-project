import { NextRequest, NextResponse } from 'next/server';
import { getWhyChooseUsData, saveWhyChooseUsData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getWhyChooseUsData();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Failed to get why choose us data:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await saveWhyChooseUsData(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error('Failed to update why choose us data:', error);
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 });
  }
}

