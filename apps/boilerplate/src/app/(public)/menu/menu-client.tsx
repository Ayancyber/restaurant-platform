"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Plus, Search, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { Reveal } from "@/components/site/reveal";

type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
};

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  tags: string[] | null;
  is_featured: boolean;
  sort_order: number;
};

export function MenuClient({
  categories,
  items,
  currency,
}: {
  categories: Category[];
  items: MenuItem[];
  currency: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const addItem = useCart((s) => s.addItem);

  const filtered = useMemo(() => {
    let result = items;

    if (activeCategory !== "all") {
      result = result.filter((item) => item.category_id === activeCategory);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [items, activeCategory, search]);

  const handleAdd = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image_url: item.image_url,
    });

    toast.success(`${item.name} added to cart`);
    setAddedId(item.id);
    window.setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <>
      <div className="mb-12 space-y-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b8175]">
              Find something you love
            </p>
            <h2 className="font-heading text-3xl font-medium tracking-[-0.035em] text-[#29251f] sm:text-4xl">
              Browse the dishes
            </h2>
          </div>

          <div className="relative w-full lg:max-w-[360px]">
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8175]" />
            <Input
              aria-label="Search menu dishes"
              placeholder="Search dishes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent pl-7 text-sm text-[#302a24] shadow-none placeholder:text-[#9a9083] focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
        </div>

        <div
          className="flex gap-2 overflow-x-auto border-b border-[#ded6ca] pb-3"
          aria-label="Filter menu by category"
        >
          <button
            type="button"
            aria-pressed={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 border-b-2 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
              activeCategory === "all"
                ? "border-primary text-primary"
                : "border-transparent text-[#82786c] hover:text-[#302a24]"
            }`}
          >
            All dishes
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                activeCategory === category.id
                  ? "border-primary text-primary"
                  : "border-transparent text-[#82786c] hover:text-[#302a24]"
            }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-[#82786c]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
            {search.trim() ? " found" : ""}
          </p>
          {search.trim() && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-y border-[#ded6ca] py-24 text-center">
          <UtensilsCrossed className="mx-auto h-7 w-7 text-primary/70" />
          <h3 className="mt-5 font-heading text-2xl text-[#302a24]">
            No dishes found
          </h3>
          <p className="mt-2 text-sm text-[#82786c]">
            Try another search or choose a different category.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="mt-6 h-11 rounded-none border-[#cfc5b7] bg-transparent px-6 text-xs uppercase tracking-[0.12em] text-[#39332c] hover:bg-[#eee8dd]"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
          {filtered.map((item, index) => {
            const isLead = index === 0 && activeCategory === "all" && !search.trim();

            return (
              <Reveal
                key={item.id}
                variant="fade-up"
                delay={Math.min(index % 6, 5) * 70}
                className={isLead ? "sm:col-span-2" : ""}
              >
                <article className="group h-full">
                  <div
                    className={`relative overflow-hidden bg-[#e8e1d6] ${
                      isLead
                        ? "aspect-[5/4] sm:aspect-[16/9]"
                        : index % 2 === 0
                          ? "aspect-[5/4]"
                          : "aspect-[4/5]"
                    }`}
                  >
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes={
                          isLead
                            ? "(max-width: 640px) 100vw, 90vw"
                            : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        }
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a99b89]">
                        <UtensilsCrossed className="h-8 w-8" />
                        <span className="mt-3 text-[9px] uppercase tracking-[0.2em]">
                          Image coming soon
                        </span>
                      </div>
                    )}

                    {item.is_featured && (
                      <span className="absolute left-4 top-4 bg-[#f7f4ed]/95 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-primary">
                        Featured
                      </span>
                    )}

                    <span className="absolute bottom-4 right-4 bg-[#f7f4ed]/95 px-3 py-2 font-heading text-sm italic text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="border-b border-[#cfc5b7] pb-5 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-heading text-2xl font-medium leading-tight text-[#302a24] sm:text-[1.7rem]">
                        {item.name}
                      </h3>
                      <span className="shrink-0 pt-1 text-sm font-medium text-primary">
                        {currency} {Number(item.price).toLocaleString()}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mt-3 max-w-[520px] text-sm leading-6 text-[#776e62]">
                        {item.description}
                      </p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-none border border-[#d5cabb] bg-transparent px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#766b5e]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={() => handleAdd(item)}
                      className={`mt-5 h-11 w-full justify-center gap-2 rounded-none text-[10px] font-semibold uppercase tracking-[0.16em] shadow-none transition-colors ${
                        addedId === item.id
                          ? "bg-[#526b4f] text-white hover:bg-[#526b4f]"
                          : "bg-[#302a24] text-[#f7f4ed] hover:bg-primary"
                      }`}
                    >
                      {addedId === item.id ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added to cart
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add to cart
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </>
  );
}
