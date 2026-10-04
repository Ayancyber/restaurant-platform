import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reservationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = reservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid reservation data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    const { data: reservation, error } = await supabase
      .from("reservations")
      .insert({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        party_size: data.party_size,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        special_requests: data.special_requests || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !reservation) {
      console.error("Reservation insert error:", error);
      return NextResponse.json(
        { error: "Failed to create reservation", details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation_id: reservation.id,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
