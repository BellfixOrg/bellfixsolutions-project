import { NextRequest, NextResponse } from 'next/server';
import { deleteBooking, updateBookingStatus } from '@/lib/db';
import { BookingStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses: BookingStatus[] = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid booking status' }, { status: 400 });
    }

    const updated = await updateBookingStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteBooking(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 });
  }
}

