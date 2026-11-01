import Link from "next/link";
import { MapPin, Phone, Mail, Camera, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { RestaurantConfig } from "@/config";

export function Footer({ settings }: { settings: RestaurantConfig }) {
  const { brand, contact, hours, social, footer, nav } = settings;
  const hasSocial = footer.showSocial && (social.instagram || social.facebook);

  return (
    <footer className="bg-[#241d18] text-[#f3ece2]">
      <div className="mx-auto max-w-[1440px] px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <Reveal className="grid gap-10 border-b border-white/15 pb-12 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16 lg:pb-16">
          <div>
            {brand.logoUrl && brand.logoUrl !== "/logo.svg" && (
              <img
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                className="mb-6 h-auto max-h-20 max-w-[220px] object-contain object-left"
              />
            )}
            <span className="mb-5 block text-[10px] uppercase tracking-[0.25em] text-[#c69b75]">
              {brand.tagline}
            </span>
            <h2 className="max-w-2xl font-heading text-4xl font-medium leading-[1.12] tracking-tight text-[#f8f1e8] sm:text-5xl lg:text-6xl">
              {brand.name}
              <span className="text-[#c69b75]">.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#bdb0a2] lg:justify-self-end">
            Good food, thoughtful moments, and a place worth coming back to.
          </p>
        </Reveal>

        <div className="grid gap-11 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-16">
          <Reveal className="space-y-5">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c69b75]">
              {footer.contactHeading}
            </h3>
            <div className="space-y-4 text-sm leading-6 text-[#c8bdb1]">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#c69b75]" />
                <span>{contact.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#c69b75]" />
                <a href={`tel:${contact.phone}`} className="transition-colors hover:text-white">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#c69b75]" />
                <a href={`mailto:${contact.email}`} className="break-all transition-colors hover:text-white">
                  {contact.email}
                </a>
              </div>
            </div>

            {hasSocial && (
              <div className="flex flex-wrap gap-4 border-t border-white/10 pt-5">
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-[#bdb0a2] transition-colors hover:text-[#d9b58e]"
                  >
                    <Camera className="h-5 w-5" />
                  </a>
                )}
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-[#bdb0a2] transition-colors hover:text-[#d9b58e]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center font-bold text-base">f</span>
                  </a>
                )}
              </div>
            )}
          </Reveal>

          <Reveal delay={100} className="space-y-5">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c69b75]">
              {footer.hoursHeading}
            </h3>
            <ul className="space-y-3 text-sm text-[#c8bdb1]">
              {hours.slice(0, footer.hoursToShow).map((h) => (
                <li key={h.day} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <span>{h.day}</span>
                  <span className="text-right text-[#eee3d6]">
                    {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200} className="space-y-5">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c69b75]">
              {footer.exploreHeading}
            </h3>
            <ul className="space-y-3 text-sm text-[#c8bdb1]">
              {nav.links
                .filter((link) => link.href !== "/")
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>

          <Reveal delay={300} className="flex flex-col justify-between gap-6">
            <div>
              <span className="mb-4 block text-[10px] uppercase tracking-[0.2em] text-[#c69b75]">
                A place at our table
              </span>
              <p className="font-heading text-2xl leading-snug text-[#f3ece2]">
                We look forward to welcoming you.
              </p>
            </div>
            <Link
              href="/reservations"
              className="inline-flex w-fit items-center gap-3 border-b border-[#c69b75] pb-2 text-[11px] uppercase tracking-[0.16em] text-[#e4c4a3] transition-colors hover:text-white"
            >
              Reserve a table
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-white/15 pt-6 text-[11px] tracking-wide text-[#a99b8e] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {brand.name}. {footer.copyright}
          </p>
          <p>{footer.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
