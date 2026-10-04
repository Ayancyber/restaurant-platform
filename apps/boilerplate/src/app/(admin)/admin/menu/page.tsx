import { createClient } from "@/lib/supabase/server";
import { restaurantConfig } from "@/config";
import { MenuAdminClient } from "./menu-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const [categoriesRes, itemsRes] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name, sort_order")
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select(
        "id, category_id, name, description, price, image_url, is_available, is_featured, tags, sort_order"
      )
      .order("sort_order"),
  ]);

  return (
    <MenuAdminClient
      categories={categoriesRes.data ?? []}
      items={itemsRes.data ?? []}
      currency={restaurantConfig.currency}
    />
  );
}
