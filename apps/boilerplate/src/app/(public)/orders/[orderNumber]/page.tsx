import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";
import { OrderTrackingClient } from "./order-tracking-client";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, type, status, payment_method, payment_status, subtotal, delivery_fee, total, delivery_address, notes, created_at, updated_at"
    )
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id, item_name, unit_price, quantity, line_total")
    .eq("order_id", order.id);

  const settings = await getSettings();

  return (
    <OrderTrackingClient
      order={order}
      items={items ?? []}
      settings={settings}
      orderNumber={orderNumber}
    />
  );
}
