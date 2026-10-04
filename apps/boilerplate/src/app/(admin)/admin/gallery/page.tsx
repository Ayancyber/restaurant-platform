import { createClient } from "@/lib/supabase/server";
import { GalleryAdminClient } from "./gallery-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("gallery")
    .select("id, title, description, image_url, sort_order, is_active, created_at")
    .order("sort_order");

  return <GalleryAdminClient images={data ?? []} />;
}
