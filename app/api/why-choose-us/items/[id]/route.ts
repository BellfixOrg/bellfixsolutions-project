import { NextRequest, NextResponse } from 'next/server';
import { deleteWhyChooseUsItem, saveWhyChooseUsItem } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await saveWhyChooseUsItem({ ...body, id });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error('Failed to update why choose us item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteWhyChooseUsItem(id);
    return NextResponse.json({ success: deleted });
  } catch (error: unknown) {
    console.error('Failed to delete why choose us item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}

