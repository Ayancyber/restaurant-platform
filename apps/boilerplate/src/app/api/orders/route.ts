import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const delivery_fee = data.type === "delivery" ? 150 : 0;
    const total = subtotal + delivery_fee;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        type: data.type,
        payment_method: data.payment_method,
        payment_status: "unpaid",
        status: "pending",
        subtotal,
        delivery_fee,
        total,
        delivery_address: data.delivery_address || null,
        notes: data.notes || null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", details: orderError?.message },
        { status: 500 }
      );
    }

    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: item.item_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        {
          error: "Order created but items failed",
          order_id: order.id,
          order_number: order.order_number,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      total,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
