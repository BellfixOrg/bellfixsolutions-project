import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { deleteService, saveService } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
    }
    const body = await req.json();
    const updated = await saveService({ ...body, id }, body.district_ids);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/services', 'layout');
      revalidatePath('/api/navigation');
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Failed to update service:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
    }
    const deleted = await deleteService(id);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/services', 'layout');
      revalidatePath('/api/navigation');
    } catch {}

    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('Failed to delete service:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
}

