import { createClient } from "@/lib/supabase/server";
import { ReservationsAdminClient } from "./reservations-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("reservations")
    .select(
      "id, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, status, special_requests, created_at"
    )
    .order("reservation_date", { ascending: false })
    .order("reservation_time", { ascending: false });

  return <ReservationsAdminClient reservations={data ?? []} />;
}
