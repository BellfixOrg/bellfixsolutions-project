import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, saveBlogPost } from '@/lib/blogs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const blogs = await getBlogPosts(!all);
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error('Failed to get blogs:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, excerpt, content } = body;

    if (!title || !category || !excerpt || !content) {
      return NextResponse.json(
        { success: false, error: 'Title, category, excerpt, and content are required.' },
        { status: 400 }
      );
    }

    const saved = await saveBlogPost(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Failed to save blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to save blog post' }, { status: 500 });
  }
}

