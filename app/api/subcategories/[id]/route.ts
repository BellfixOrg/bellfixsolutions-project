import { NextRequest, NextResponse } from 'next/server';
import { deleteSubcategory } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSubcategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete subcategory:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete subcategory' },
      { status: 400 }
    );
  }
}

