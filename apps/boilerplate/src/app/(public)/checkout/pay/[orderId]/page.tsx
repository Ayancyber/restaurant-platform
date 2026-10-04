import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";
import { PaymentClient } from "./payment-client";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  // Use admin client since customers aren't authenticated
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, payment_method, payment_status, total, status, customer_marked_paid_at"
    )
    .eq("id", orderId)
    .single();

  if (!order) {
    notFound();
  }

  const settings = await getSettings();

  return (
    <PaymentClient
      order={order}
      settings={settings}
    />
  );
}
