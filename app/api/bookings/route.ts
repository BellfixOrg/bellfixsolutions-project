import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookings } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const bookings = await getBookings(status, search);
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Failed to get bookings:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    const { customer_name, phone, service_name, location, preferred_date, message } = body;

    if (!customer_name || !phone || !service_name || !location || !preferred_date) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, service, location, and preferred date are required.' },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      customer_name,
      phone,
      service_name,
      location,
      preferred_date,
      message: message || '',
      status: 'new',
      category_id: body.category_id || undefined,
      category_name: body.category_name || undefined,
      subcategory_id: body.subcategory_id || undefined,
      subcategory_name: body.subcategory_name || undefined,
      service_id: body.service_id || undefined,
      district_id: body.district_id || undefined,
      district_name: body.district_name || undefined,
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to save booking to database' }, { status: 500 });
  }
}

