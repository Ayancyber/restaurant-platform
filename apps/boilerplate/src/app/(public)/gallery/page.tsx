import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { redirect } from "next/navigation";
import { GalleryClient } from "./gallery-client";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const settings = await getSettings();

  if (!settings.features.gallery) {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: images } = await supabase
    .from("gallery")
    .select("id, title, description, image_url, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="container mx-auto px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          Gallery
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A glimpse into {settings.brand.name} — our food, our space, our story.
        </p>
      </header>

      <GalleryClient images={images ?? []} />
    </div>
  );
}
