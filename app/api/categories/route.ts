import { NextRequest, NextResponse } from 'next/server';
import { getServiceCategories, saveServiceCategory } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const categories = await getServiceCategories(!all);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Failed to get categories:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Category name and slug are required.' },
        { status: 400 }
      );
    }

    const saved = await saveServiceCategory(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error('Failed to save category:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save category' },
      { status: 500 }
    );
  }
}

