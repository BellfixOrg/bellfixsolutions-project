import { NextRequest, NextResponse } from 'next/server';
import { deleteBlogPost, saveBlogPost } from '@/lib/blogs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await saveBlogPost({ ...body, id });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteBlogPost(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete blog post' }, { status: 500 });
  }
}

