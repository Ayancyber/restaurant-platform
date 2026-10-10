import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/site/reveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const settings = await getSettings();
  const { brand, contact, hours, currency, home } = settings;

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
      {home.sections.hero && (
        <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          {/* Ambient background blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl animate-float"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl animate-float [animation-delay:2s]"
          />

          <div className="container relative mx-auto px-4 py-20 text-center">
            <Badge
              variant="secondary"
              className="mb-6 text-sm animate-fade-in-up"
            >
              {home.hero.badge}
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in-up delay-150">
              {brand.name}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in-up delay-300">
              {brand.heroPunchline}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up delay-500">
              <Button
                asChild
                size="lg"
                className="gap-2 group transition-transform hover:scale-[1.03] active:scale-95"
              >
                <Link href={home.hero.primaryCta.href}>
                  {home.hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="transition-transform hover:scale-[1.03] active:scale-95"
              >
                <Link href={home.hero.secondaryCta.href}>
                  {home.hero.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </div>

          {/* Scroll hint */}
          <ChevronDown
            aria-hidden
            className="absolute bottom-6 left-1/2 h-5 w-5 -translate-x-1/2 text-muted-foreground animate-bounce-soft"
          />
        </section>
      )}

      {home.sections.quickInfo && (
        <section className="border-y bg-muted/30">
          <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-3">
            <Reveal
              variant="fade-left"
              className="flex items-center gap-3"
            >
              <Clock className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Today ({today})</p>
                <p className="text-sm text-muted-foreground">
                  {todayHours?.closed
                    ? "Closed"
                    : `${todayHours?.open} – ${todayHours?.close}`}
                </p>
              </div>
            </Reveal>
            <Reveal
              delay={120}
              className="flex items-center gap-3"
            >
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {contact.address}
                </p>
              </div>
            </Reveal>
            <Reveal
              variant="fade-right"
              delay={240}
              className="flex items-center gap-3"
            >
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Call us</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {contact.phone}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {home.sections.featured && (
        <section className="container mx-auto px-4 py-20">
          <Reveal className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              {home.featured.heading}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {home.featured.subheading}
            </p>
          </Reveal>

          {featuredItems && featuredItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item, i) => (
                <Reveal
                  key={item.id}
                  delay={(i % 3) * 120}
                  variant="zoom-in"
                  className="h-full"
                >
                  <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
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
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No featured items yet.
            </p>
          )}

          <Reveal delay={200} className="mt-12 text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Link href="/menu">
                {home.featured.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Reveal>
        </section>
      )}
    </>
  );
}
