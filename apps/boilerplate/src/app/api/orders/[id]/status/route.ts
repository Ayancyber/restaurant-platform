import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, type, status, payment_method, payment_status, subtotal, delivery_fee, total, delivery_address, notes, created_at, updated_at"
      )
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("id, item_name, unit_price, quantity, line_total")
      .eq("order_id", order.id);

    return NextResponse.json({
      order,
      items: items ?? [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
