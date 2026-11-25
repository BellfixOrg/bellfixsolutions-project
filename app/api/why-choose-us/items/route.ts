import { NextRequest, NextResponse } from 'next/server';
import { saveWhyChooseUsItem } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const item = await saveWhyChooseUsItem(body);
    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    console.error('Failed to create why choose us item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}

