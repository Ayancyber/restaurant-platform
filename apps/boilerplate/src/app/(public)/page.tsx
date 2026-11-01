import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/site-url";
import { Reveal } from "@/components/site/reveal";

export const dynamic = "force-dynamic";

const demoDishImages = [
  "/images/demo/dish-pasta.jpg",
  "/images/demo/dish-pizza.webp",
  "/images/demo/dish-salad.webp",
];

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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const todayHours = hours.find((h) => h.day === today);
  const baseUrl = getBaseUrl();

  const openingHours = hours
    .filter((h) => !h.closed)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${h.day}`,
      opens: h.open,
      closes: h.close,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: brand.name,
    description: settings.seo?.description || brand.tagline || "",
    image:
      brand.logoUrl && !brand.logoUrl.startsWith("data:")
        ? `${baseUrl}${brand.logoUrl}`
        : undefined,
    url: baseUrl || undefined,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressCountry: "PK",
    },
    servesCuisine: settings.seo?.keywords?.join(", ") || undefined,
    priceRange: "$$",
    currenciesAccepted: currency,
    paymentAccepted: "Cash, JazzCash, Easypaisa",
    openingHoursSpecification: openingHours,
  };

  const hasFeaturedItems = Boolean(featuredItems?.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {home.sections.hero && (
        <section className="relative overflow-hidden bg-[#f7f4ed]">
          <div className="mx-auto grid min-h-[720px] max-w-[1600px] items-center gap-10 px-5 pb-16 pt-12 sm:px-10 lg:min-h-[790px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-4 lg:px-16 lg:py-16 xl:px-24">
            <div className="relative z-10 order-2 flex flex-col items-start lg:order-1 lg:py-16">
              <Reveal variant="fade-up">
                <div className="mb-9 flex items-center gap-3">
                  <span className="h-px w-10 bg-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary sm:text-xs">
                    {home.hero.badge}
                  </span>
                </div>
              </Reveal>

              <Reveal delay={100} variant="fade-up">
                <p className="mb-3 font-heading text-lg italic text-[#927d68] sm:text-xl">
                  Welcome to
                </p>
                <h1 className="max-w-[700px] font-heading text-[clamp(3.8rem,8vw,7.7rem)] font-medium leading-[0.88] tracking-[-0.065em] text-[#29251f]">
                  {brand.name}
                  <span className="ml-1 text-primary">.</span>
                </h1>
              </Reveal>

              <Reveal delay={180} variant="fade-up">
                <p className="mt-8 max-w-[390px] text-base leading-8 text-[#746b60] sm:text-lg">
                  {brand.heroPunchline}
                </p>
              </Reveal>

              <Reveal delay={260} variant="fade-up">
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-none px-7 text-xs uppercase tracking-[0.13em] shadow-none"
                  >
                    <Link href={home.hero.primaryCta.href}>
                      {home.hero.primaryCta.label}
                      <ArrowUpRight className="ml-3 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-none border-[#c9bfb0] bg-transparent px-7 text-xs uppercase tracking-[0.13em] text-[#39332c] shadow-none hover:bg-[#eee8dd]"
                  >
                    <Link href={home.hero.secondaryCta.href}>
                      {home.hero.secondaryCta.label}
                    </Link>
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={340} variant="fade-up">
                <div className="mt-16 flex items-center gap-5 border-t border-[#ded6ca] pt-5">
                  <span className="font-heading text-3xl italic text-primary">
                    01
                  </span>
                  <span className="max-w-[190px] text-[10px] uppercase leading-5 tracking-[0.2em] text-[#8b8175]">
                    A place for good food and good company
                  </span>
                </div>
              </Reveal>
            </div>

            <div className="relative order-1 mx-auto w-full max-w-[680px] lg:order-2 lg:ml-auto lg:mr-0">
              <Reveal variant="fade-right">
                <div className="relative ml-auto h-[390px] w-[88%] overflow-hidden sm:h-[520px] lg:h-[660px] lg:w-[82%]">
                  <Image
                    src="/images/demo/hero-main.jpg"
                    alt={`A selection of dishes from ${brand.name}`}
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 1024px) 88vw, 55vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <Reveal delay={180} variant="fade-up">
                <div className="absolute -bottom-9 left-0 h-[190px] w-[42%] overflow-hidden border-[7px] border-[#f7f4ed] sm:h-[260px] lg:-bottom-5 lg:left-[-2%] lg:h-[300px] lg:w-[43%]">
                  <Image
                    src="/images/demo/hero-detail.jpg"
                    alt={`A close-up of food preparation at ${brand.name}`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 42vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <div className="absolute -right-1 top-8 hidden [writing-mode:vertical-rl] lg:block">
                <span className="text-[9px] uppercase tracking-[0.35em] text-[#8e8171]">
                  Made with passion · Served with love
                </span>
              </div>

              <div className="absolute -bottom-12 right-[3%] hidden font-heading text-6xl italic text-primary/80 lg:block">
                Made with care
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#ded6ca]" />
        </section>
      )}

      {home.sections.quickInfo && (
        <section className="bg-[#f7f4ed]">
          <div className="mx-auto grid max-w-[1440px] gap-7 px-5 py-9 sm:px-10 md:grid-cols-3 lg:px-16 xl:px-24">
            <Reveal variant="fade-left" className="flex items-start gap-4">
              <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d8173]">
                  Today · {today}
                </p>
                <p className="mt-2 font-heading text-xl text-[#302a24]">
                  {todayHours?.closed
                    ? "Closed today"
                    : `${todayHours?.open ?? "Hours unavailable"} – ${todayHours?.close ?? ""}`}
                </p>
              </div>
            </Reveal>

            <Reveal delay={100} className="flex items-start gap-4 md:border-l md:border-[#ded6ca] md:pl-8">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d8173]">
                  Find us
                </p>
                <p className="mt-2 max-w-[280px] font-heading text-xl leading-snug text-[#302a24]">
                  {contact.address}
                </p>
              </div>
            </Reveal>

            <Reveal delay={200} className="flex items-start gap-4 md:border-l md:border-[#ded6ca] md:pl-8">
              <Phone className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d8173]">
                  Reservations & enquiries
                </p>
                <a
                  href={`tel:${contact.phone}`}
                  className="mt-2 inline-block font-heading text-xl text-[#302a24] transition-colors hover:text-primary"
                >
                  {contact.phone}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {home.sections.featured && (
        <section className="overflow-hidden bg-[#eee9df] py-24 sm:py-32">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 xl:px-24">
            <div className="mb-14 grid gap-8 md:grid-cols-[1fr_0.65fr] md:items-end lg:mb-20">
              <Reveal variant="fade-up">
                <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                  <span className="h-px w-9 bg-primary" />
                  From our kitchen
                </p>
                <h2 className="max-w-[720px] font-heading text-5xl font-medium leading-[0.98] tracking-[-0.045em] text-[#29251f] sm:text-6xl lg:text-7xl">
                  {home.featured.heading}
                  <span className="text-primary">.</span>
                </h2>
              </Reveal>

              <Reveal delay={120} variant="fade-up">
                <p className="max-w-[330px] text-sm leading-7 text-[#776e62] md:ml-auto md:pb-2">
                  {home.featured.subheading}
                </p>
              </Reveal>
            </div>

            {hasFeaturedItems ? (
              <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
                {featuredItems!.map((item, index) => {
                  const demoImage = demoDishImages[index % demoDishImages.length];
                  const imageSrc = item.image_url || demoImage;
                  const isLead = index === 0;

                  return (
                    <Reveal
                      key={item.id}
                      delay={(index % 3) * 100}
                      variant="fade-up"
                      className={isLead ? "md:row-span-2" : ""}
                    >
                      <article className="group h-full">
                        <div
                          className={`relative overflow-hidden bg-[#ded6ca] ${
                            isLead
                              ? "aspect-[4/5] md:aspect-[4/5]"
                              : index % 2 === 0
                                ? "aspect-[5/4]"
                                : "aspect-[4/5]"
                          }`}
                        >
                          <Image
                            src={imageSrc}
                            alt={item.name}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                          />
                          <span className="absolute left-4 top-4 bg-[#f7f4ed]/95 px-3 py-2 font-heading text-sm italic text-primary">
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
                            <p className="mt-3 max-w-[420px] text-sm leading-6 text-[#776e62]">
                              {item.description}
                            </p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {item.tags.map((tag: string) => (
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
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <div className="border-y border-[#cfc5b7] py-16 text-center">
                <UtensilsCrossed className="mx-auto h-7 w-7 text-primary/70" />
                <p className="mt-4 font-heading text-2xl text-[#302a24]">
                  The menu is being prepared
                </p>
                <p className="mt-2 text-sm text-[#776e62]">
                  No featured items yet.
                </p>
              </div>
            )}

            <Reveal delay={150} className="mt-14 flex justify-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-none border-[#a99a88] bg-transparent px-8 text-xs uppercase tracking-[0.16em] text-[#39332c] hover:bg-[#e3dccf]"
              >
                <Link href="/menu">
                  {home.featured.ctaLabel}
                  <ArrowRight className="ml-4 h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
        </section>
      )}

      {home.sections.hero && settings.features.reservations && (
        <section className="relative overflow-hidden bg-[#29251f] text-[#f7f4ed]">
          <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[390px] lg:min-h-[570px]">
              <Image
                src="/images/demo/restaurant-interior.webp"
                alt="Warm and welcoming restaurant dining room"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              <span className="absolute bottom-7 left-7 text-[10px] uppercase tracking-[0.25em] text-white/85 sm:bottom-10 sm:left-10">
                A welcoming space for your next visit
              </span>
            </div>

            <div className="flex flex-col justify-center px-7 py-16 sm:px-12 lg:px-16 xl:px-24">
              <Reveal variant="fade-up">
                <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d5a17e]">
                  <span className="h-px w-9 bg-[#d5a17e]" />
                  Plan your next visit
                </p>
                <h2 className="max-w-[560px] font-heading text-5xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                  Good food deserves <span className="italic text-[#d5a17e]">good company.</span>
                </h2>
                <p className="mt-7 max-w-[390px] text-sm leading-7 text-white/60">
                  Join us for a relaxed meal, thoughtful hospitality and time well spent. We look forward to welcoming you.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-9 h-12 w-fit rounded-none bg-[#f0e9dc] px-7 text-xs uppercase tracking-[0.15em] text-[#29251f] shadow-none hover:bg-white"
                >
                  <Link href={home.hero.secondaryCta.href}>
                    {home.hero.secondaryCta.label}
                    <ArrowUpRight className="ml-4 h-4 w-4" />
                  </Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
