import { createClient } from "@/lib/supabase/server";
import { CategoriesAdminClient } from "./categories-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const [categoriesRes, itemsRes] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name, description, sort_order, is_active, created_at")
      .order("sort_order"),
    supabase.from("menu_items").select("category_id"),
  ]);

  // Count items per category
  const itemCounts: Record<string, number> = {};
  for (const item of itemsRes.data ?? []) {
    const cid = item.category_id;
    itemCounts[cid] = (itemCounts[cid] ?? 0) + 1;
  }

  return (
    <CategoriesAdminClient
      categories={categoriesRes.data ?? []}
      itemCounts={itemCounts}
    />
  );
}
