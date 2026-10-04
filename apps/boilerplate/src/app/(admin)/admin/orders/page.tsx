import { createClient } from "@/lib/supabase/server";
import { restaurantConfig } from "@/config";
import { OrdersAdminClient } from "./orders-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const [ordersRes, itemsRes] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, customer_email, type, status, payment_method, payment_status, subtotal, delivery_fee, total, delivery_address, notes, created_at"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("order_items")
      .select("id, order_id, item_name, unit_price, quantity, line_total"),
  ]);

  return (
    <OrdersAdminClient
      orders={ordersRes.data ?? []}
      items={itemsRes.data ?? []}
      currency={restaurantConfig.currency}
    />
  );
}
