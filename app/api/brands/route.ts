import { NextRequest, NextResponse } from 'next/server';
import { getBrands, saveBrand } from '@/lib/brands';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const brands = await getBrands(!all);
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error('Failed to get brands:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve brands' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logo_url } = body;

    if (!logo_url) {
      return NextResponse.json({ success: false, error: 'Brand logo image is required.' }, { status: 400 });
    }

    const saved = await saveBrand(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Failed to save brand:', error);
    return NextResponse.json({ success: false, error: 'Failed to save brand' }, { status: 500 });
  }
}

