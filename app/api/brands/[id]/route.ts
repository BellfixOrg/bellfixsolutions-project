import { NextRequest, NextResponse } from 'next/server';
import { deleteBrand, saveBrand } from '@/lib/brands';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await saveBrand({ ...body, id });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update brand:', error);
    return NextResponse.json({ success: false, error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteBrand(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete brand:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete brand' }, { status: 500 });
  }
}

