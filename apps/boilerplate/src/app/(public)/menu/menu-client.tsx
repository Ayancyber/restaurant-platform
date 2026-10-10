"use client";

import { useState, useMemo } from "react";
import { Check, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const openCart = useCart((s) => s.openCart);

  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== "all") {
      result = result.filter((i) => i.category_id === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
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
    // Flash "Added ✓" on the button
    setAddedId(item.id);
    window.setTimeout(() => setAddedId(null), 1200);
    // Optional: open cart drawer automatically
    // openCart();
  };

  return (
    <>
      <div className="mx-auto mb-8 max-w-md relative animate-fade-in-up">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-10 animate-fade-in-up delay-150"
      >
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto pb-1">
          <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="whitespace-nowrap">
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>


      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No items found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <Reveal
              key={item.id}
              variant="zoom-in"
              delay={Math.min(i, 8) * 70}
              className="h-full"
            >
            <Card className="group h-full overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <span className="text-sm">No image</span>
                )}
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-lg font-semibold">
                    {item.name}
                  </h3>
                  <span className="whitespace-nowrap font-medium text-primary">
                    {currency} {Number(item.price).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground flex-1">
                  {item.description}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  className={
                    addedId === item.id
                      ? "mt-4 w-full gap-2 bg-green-600 hover:bg-green-600 transition-colors"
                      : "mt-4 w-full gap-2"
                  }
                  onClick={() => handleAdd(item)}
                >
                  {addedId === item.id ? (
                    <>
                      <Check className="h-4 w-4 animate-bounce-soft" />
                      Added!
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
