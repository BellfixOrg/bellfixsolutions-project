import { NextRequest, NextResponse } from 'next/server';
import { getDistricts, saveDistrict } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const districts = await getDistricts(!all);
    return NextResponse.json({ success: true, data: districts });
  } catch (error: any) {
    console.error('Failed to get districts:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve districts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'District name and slug are required.' },
        { status: 400 }
      );
    }

    const saved = await saveDistrict(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error('Failed to save district:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save district' },
      { status: 500 }
    );
  }
}

