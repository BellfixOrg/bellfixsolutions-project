import { NextRequest, NextResponse } from 'next/server';
import { getServices, saveService } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const services = await getServices(!all);
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('Failed to get services:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, short_description, main_image } = body;

    if (!name || !slug || !short_description || !main_image) {
      return NextResponse.json({ success: false, error: 'Name, slug, short description, and main image are required.' }, { status: 400 });
    }

    const saved = await saveService(body, body.district_ids);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error('Failed to save service:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
    }
    const saved = await saveService(body, body.district_ids);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error('Failed to update service:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update service' }, { status: 500 });
  }
}

