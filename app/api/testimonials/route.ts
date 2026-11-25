import { NextRequest, NextResponse } from 'next/server';
import { getTestimonials, saveTestimonial } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';
    const testimonials = await getTestimonials(!all);
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Failed to get testimonials:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, review } = body;

    if (!customer_name || !review) {
      return NextResponse.json({ success: false, error: 'Customer name and review are required.' }, { status: 400 });
    }

    const saved = await saveTestimonial(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Failed to save testimonial:', error);
    return NextResponse.json({ success: false, error: 'Failed to save testimonial' }, { status: 500 });
  }
}

