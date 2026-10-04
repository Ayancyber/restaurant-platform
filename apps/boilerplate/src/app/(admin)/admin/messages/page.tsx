import { createClient } from "@/lib/supabase/server";
import { MessagesAdminClient } from "./messages-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, is_read, created_at")
    .order("created_at", { ascending: false });

  return <MessagesAdminClient messages={data ?? []} />;
}
