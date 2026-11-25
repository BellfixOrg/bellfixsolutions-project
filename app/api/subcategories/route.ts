import { NextRequest, NextResponse } from 'next/server';
import { getSubcategories, saveSubcategory } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const categoryId = searchParams.get('categoryId') || undefined;
    const categorySlug = searchParams.get('categorySlug') || undefined;

    const subcategories = await getSubcategories({
      onlyActive: !all,
      categoryId,
      categorySlug,
    });

    return NextResponse.json({ success: true, data: subcategories });
  } catch (error: any) {
    console.error('Failed to get subcategories:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve subcategories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_id, name, slug } = body;

    if (!category_id || !name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Category, subcategory name, and slug are required.' },
        { status: 400 }
      );
    }

    const saved = await saveSubcategory(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error('Failed to save subcategory:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save subcategory' },
      { status: 500 }
    );
  }
}

