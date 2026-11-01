import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/site/reveal";
import { MenuClient } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const supabase = await createClient();
  const settings = await getSettings();

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

  return (
    <main className="min-h-screen bg-[#f7f4ed]">
      <section className="border-b border-[#ded6ca]">
        <div className="mx-auto max-w-[1600px] px-5 pb-14 pt-16 sm:px-10 sm:pb-20 sm:pt-24 lg:px-16 xl:px-24">
          <Reveal variant="fade-up">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary sm:text-xs">
              <span className="h-px w-10 bg-primary" />
              A taste of what we offer
            </p>
            <div className="grid gap-8 md:grid-cols-[1fr_0.55fr] md:items-end">
              <h1 className="max-w-[900px] font-heading text-[clamp(3.8rem,9vw,8rem)] font-medium leading-[0.88] tracking-[-0.065em] text-[#29251f]">
                Our menu<span className="text-primary">.</span>
              </h1>
              <p className="max-w-[390px] text-sm leading-7 text-[#776e62] md:ml-auto md:pb-2 sm:text-base">
                {settings.brand.tagline}
              </p>
            </div>
          </Reveal>
          <div className="mt-12 flex items-center justify-between border-t border-[#ded6ca] pt-5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8b8175]">
              Explore the selection
            </span>
            <span className="font-heading text-2xl italic text-primary">01</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-12 sm:px-10 sm:py-16 lg:px-16 xl:px-24">
        <MenuClient
          categories={categories ?? []}
          items={items ?? []}
          currency={settings.currency}
        />
      </section>
    </main>
  );
}
