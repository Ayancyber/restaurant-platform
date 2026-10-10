import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderSchema } from "@/lib/validators";

/**
 * Generate a URL-safe, cryptographically random token.
 * 15 bytes → 20 base64 chars → stripped of +/= → ~20 URL-safe chars.
 * This is the token used to view the order at /orders/[token].
 */
function generateTrackingToken(): string {
  return randomBytes(15)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Delivery fee — could be moved to config later
const DELIVERY_FEE = 150;

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

    // -----------------------------------------------------------------
    // SECURITY: Never trust client prices.
    // Fetch each menu item's current price, name, and availability
    // straight from the database.
    // -----------------------------------------------------------------
    const itemIds = data.items.map((i) => i.menu_item_id);

    const { data: dbItems, error: dbError } = await supabase
      .from("menu_items")
      .select("id, name, price, is_available")
      .in("id", itemIds);

    if (dbError || !dbItems) {
      console.error("Menu lookup error:", dbError);
      return NextResponse.json(
        { error: "Could not validate menu items" },
        { status: 500 }
      );
    }

    // Build a quick lookup map
    const dbItemMap = new Map(dbItems.map((i) => [i.id, i]));

    // Validate every requested item
    const verifiedItems: {
      menu_item_id: string;
      item_name: string;
      unit_price: number;
      quantity: number;
      line_total: number;
    }[] = [];

    for (const item of data.items) {
      const dbItem = dbItemMap.get(item.menu_item_id);

      if (!dbItem) {
        return NextResponse.json(
          { error: "Menu item no longer exists" },
          { status: 400 }
        );
      }

      if (!dbItem.is_available) {
        return NextResponse.json(
          { error: `"${dbItem.name}" is currently unavailable` },
          { status: 400 }
        );
      }

      const lineTotal = Number(dbItem.price) * item.quantity;
      verifiedItems.push({
        menu_item_id: dbItem.id,
        item_name: dbItem.name,
        unit_price: Number(dbItem.price),
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    // -----------------------------------------------------------------
    // Compute totals entirely on the server
    // -----------------------------------------------------------------
    const subtotal = verifiedItems.reduce((sum, i) => sum + i.line_total, 0);
    const delivery_fee = data.type === "delivery" ? DELIVERY_FEE : 0;
    const total = subtotal + delivery_fee;

    // -----------------------------------------------------------------
    // Create the order
    // -----------------------------------------------------------------
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
        tracking_token: generateTrackingToken(),
      })
      .select("id, order_number, tracking_token")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", details: orderError?.message },
        { status: 500 }
      );
    }

    // -----------------------------------------------------------------
    // Insert verified order items (server-priced)
    // -----------------------------------------------------------------
    const orderItems = verifiedItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: item.item_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      // Rollback: delete the order so we don't leave an empty shell
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to save order items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      tracking_token: order.tracking_token,
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
