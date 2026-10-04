import { createClient } from "@/lib/supabase/server";
import { restaurantConfig } from "@/config";
import { MenuClient } from "./menu-client";

export const revalidate = 60; // revalidate every 60s

export default async function MenuPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name, description, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, category_id, name, description, price, image_url, tags, is_featured, sort_order")
    .eq("is_available", true)
    .order("sort_order");

  const { brand, currency } = restaurantConfig;

  return (
    <div className="container mx-auto px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          Our Menu
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {brand.tagline}
        </p>
      </header>

      <MenuClient
        categories={categories ?? []}
        items={items ?? []}
        currency={currency}
      />
    </div>
  );
}
