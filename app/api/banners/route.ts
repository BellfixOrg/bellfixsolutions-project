import { NextRequest, NextResponse } from 'next/server';
import { getBanners, saveBanner } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const banners = await getBanners(!all);
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('Failed to get banners:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve banners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { heading, background_image } = body;

    if (!heading || !background_image) {
      return NextResponse.json({ success: false, error: 'Heading and background image are required.' }, { status: 400 });
    }

    const saved = await saveBanner(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Failed to save banner:', error);
    return NextResponse.json({ success: false, error: 'Failed to save banner' }, { status: 500 });
  }
}

