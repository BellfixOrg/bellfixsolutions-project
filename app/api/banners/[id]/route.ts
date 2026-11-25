import { NextRequest, NextResponse } from 'next/server';
import { deleteBanner, saveBanner } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await saveBanner({ ...body, id });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update banner:', error);
    return NextResponse.json({ success: false, error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteBanner(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete banner:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete banner' }, { status: 500 });
  }
}

