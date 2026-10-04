import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();

    // Verify order exists
    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_marked_paid_at")
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already marked — idempotent
    if (order.customer_marked_paid_at) {
      return NextResponse.json({ success: true, already_marked: true });
    }

    const { error } = await supabase
      .from("orders")
      .update({ customer_marked_paid_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Notify-paid error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
