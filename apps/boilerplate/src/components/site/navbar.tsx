"use client";

import Link from "next/link";
import { Menu, ShoppingCart, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import type { RestaurantConfig } from "@/config";

export function Navbar({ settings }: { settings: RestaurantConfig }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCart((s) => s.getItemCount());
  const openCart = useCart((s) => s.openCart);
  const { brand, nav, contact } = settings;

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            {brand.name.charAt(0)}
          </div>
          <span className="font-heading text-xl font-semibold tracking-tight">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {nav.showPhone && (
            <a
              href={`tel:${contact.phone}`}
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-4 w-4" />
              {contact.phone}
            </a>
          )}

          <Button
            variant="default"
            size="sm"
            className="gap-2 relative"
            onClick={openCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">{nav.ctaLabel}</span>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{brand.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {nav.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                {nav.showPhone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-base font-medium mt-4"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
