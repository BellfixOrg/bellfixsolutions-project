import { NextRequest, NextResponse } from 'next/server';
import { deleteServiceCategory } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteServiceCategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete category:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete category' },
      { status: 400 }
    );
  }
}

