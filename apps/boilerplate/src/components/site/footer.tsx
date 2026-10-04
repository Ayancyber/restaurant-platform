import Link from "next/link";
import { MapPin, Phone, Mail, Share2 } from "lucide-react";
import { restaurantConfig } from "@/config";

export function Footer() {
  const { brand, contact, hours, social } = restaurantConfig;

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="space-y-3">
          <h3 className="font-heading text-xl font-semibold">{brand.name}</h3>
          <p className="text-sm text-muted-foreground">{brand.tagline}</p>
          <div className="flex gap-4 pt-2 text-sm">
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                Instagram
              </a>
            )}
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h4 className="font-medium">Contact</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{contact.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${contact.phone}`} className="hover:text-primary">
                {contact.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${contact.email}`} className="hover:text-primary">
                {contact.email}
              </a>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="space-y-3">
          <h4 className="font-medium">Hours</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {hours.slice(0, 4).map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>
                  {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h4 className="font-medium">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/menu" className="hover:text-primary">
                Our Menu
              </Link>
            </li>
            <li>
              <Link href="/reservations" className="hover:text-primary">
                Book a Table
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-primary">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p>Made with ❤️ in Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
