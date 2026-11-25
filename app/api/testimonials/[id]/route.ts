import { NextRequest, NextResponse } from 'next/server';
import { deleteTestimonial, saveTestimonial } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await saveTestimonial({ ...body, id });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    return NextResponse.json({ success: false, error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteTestimonial(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete testimonial:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete testimonial' }, { status: 500 });
  }
}

