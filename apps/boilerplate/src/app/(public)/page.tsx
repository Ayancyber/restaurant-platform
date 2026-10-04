import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { restaurantConfig } from "@/config";

export default async function Home() {
  const supabase = await createClient();
  const { brand, contact, hours, currency, home } = restaurantConfig;

  const { data: featuredItems } = await supabase
    .from("menu_items")
    .select("id, name, description, price, image_url, tags, category_id")
    .eq("is_featured", true)
    .eq("is_available", true)
    .limit(home.featured.limit);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayHours = hours.find((h) => h.day === today);

  return (
    <>
      {/* HERO */}
      {home.sections.hero && (
        <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 py-20 text-center">
            <Badge variant="secondary" className="mb-6 text-sm">
              {home.hero.badge}
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {brand.name}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {brand.heroPunchline}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href={home.hero.primaryCta.href}>
                  {home.hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={home.hero.secondaryCta.href}>
                  {home.hero.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* QUICK INFO */}
      {home.sections.quickInfo && (
        <section className="border-y bg-muted/30">
          <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Today ({today})</p>
                <p className="text-sm text-muted-foreground">
                  {todayHours?.closed
                    ? "Closed"
                    : `${todayHours?.open} – ${todayHours?.close}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {contact.address}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Call us</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED */}
      {home.sections.featured && (
        <section className="container mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              {home.featured.heading}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {home.featured.subheading}
            </p>
          </div>

          {featuredItems && featuredItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">No image</span>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-lg font-semibold">
                        {item.name}
                      </h3>
                      <span className="whitespace-nowrap font-medium text-primary">
                        {currency} {Number(item.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No featured items yet.
            </p>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/menu">
                {home.featured.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
