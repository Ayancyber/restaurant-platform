"use client";

import Link from "next/link";
import { Menu, ShoppingCart, Phone, Package } from "lucide-react";
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
import { useRecentOrders } from "@/lib/hooks/use-recent-orders";
import type { RestaurantConfig } from "@/config";

export function Navbar({ settings }: { settings: RestaurantConfig }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCart((s) => s.getItemCount());
  const openCart = useCart((s) => s.openCart);
  const { orders: recentOrders, mounted: recentsMounted } = useRecentOrders();
  const { brand, nav, contact } = settings;

  useEffect(() => setMounted(true), []);

  const hasRecent = recentsMounted && recentOrders.length > 0;
  const mostRecent = hasRecent ? recentOrders[0] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {brand.logoUrl && brand.logoUrl !== "/logo.svg" ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              {brand.name.charAt(0)}
            </div>
          )}
          <span className="font-heading text-xl font-semibold tracking-tight">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <Link
            href="/track-order"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 relative"
          >
            <Package className="h-3.5 w-3.5" />
            Track Order
            {hasRecent && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary absolute -top-0.5 -right-2" />
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {nav.showPhone && (
            <a
              href={`tel:${contact.phone}`}
              className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-4 w-4" />
              {contact.phone}
            </a>
          )}

          <Button
            variant="default"
            size="sm"
            className="gap-2 relative transition-transform active:scale-95"
            onClick={openCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">{nav.ctaLabel}</span>
            {mounted && itemCount > 0 && (
              <span
                key={itemCount}
                className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium animate-zoom-in-soft"
              >
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
              <nav className="mt-6 flex flex-col gap-1 px-2">
                {nav.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium hover:text-primary hover:bg-muted rounded-md px-3 py-2.5 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/track-order"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium hover:text-primary hover:bg-muted rounded-md px-3 py-2.5 transition-colors flex items-center gap-2 relative"
                >
                  <Package className="h-4 w-4" />
                  Track Order
                  {hasRecent && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto">
                      {recentOrders.length}
                    </span>
                  )}
                </Link>
                {hasRecent && mostRecent && (
                  <Link
                    href={`/orders/${mostRecent.orderNumber}`}
                    onClick={() => setOpen(false)}
                    className="text-xs text-muted-foreground hover:text-primary rounded-md px-3 py-2 transition-colors -mt-1 ml-6"
                  >
                    ↳ Recent: {mostRecent.orderNumber}
                  </Link>
                )}
                {nav.showPhone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-base font-medium mt-4 px-3 py-2.5 hover:bg-muted rounded-md transition-colors"
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
