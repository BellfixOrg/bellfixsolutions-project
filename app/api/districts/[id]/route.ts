import { NextRequest, NextResponse } from 'next/server';
import { deleteDistrict } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'District ID is required' }, { status: 400 });
    }
    await deleteDistrict(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete district:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete district' },
      { status: 400 }
    );
  }
}

