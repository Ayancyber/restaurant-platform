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
    <header className="sticky top-0 z-40 w-full border-b border-[#e8e0d5] bg-[#faf8f4]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          {brand.logoUrl && brand.logoUrl !== "/logo.svg" ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-10 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a98a]/60 bg-[#efe7dc] font-heading text-xl text-[#8b4b32]">
              {brand.name.charAt(0)}
            </div>
          )}
          <span className="font-heading text-xl font-semibold tracking-tight text-[#30251f] transition-colors group-hover:text-[#9a5639] sm:text-2xl">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-2 text-[12px] font-medium uppercase tracking-[0.13em] text-[#75685e] transition-colors hover:text-[#9a5639]"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-[#a65e40] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <Link
            href="/track-order"
            className="relative inline-flex items-center gap-2 py-2 text-[12px] font-medium uppercase tracking-[0.13em] text-[#75685e] transition-colors hover:text-[#9a5639]"
          >
            <Package className="h-3.5 w-3.5" />
            Track order
            {hasRecent && (
              <span className="absolute -right-2 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#a65e40]" />
            )}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {nav.showPhone && (
            <a
              href={`tel:${contact.phone}`}
              className="hidden items-center gap-2 border-r border-[#e3d9cd] pr-5 text-xs tracking-wide text-[#75685e] transition-colors hover:text-[#9a5639] xl:flex"
            >
              <Phone className="h-3.5 w-3.5" />
              {contact.phone}
            </a>
          )}

          <Button
            variant="default"
            size="sm"
            className="relative h-10 gap-2 rounded-none bg-[#8f4932] px-4 text-[11px] font-medium uppercase tracking-[0.12em] text-white shadow-none transition-colors hover:bg-[#713923] active:scale-[0.98] sm:px-5"
            onClick={openCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">{nav.ctaLabel}</span>
            {mounted && itemCount > 0 && (
              <span
                key={itemCount}
                className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d9b77e] px-1 text-[10px] font-semibold text-[#30251f] animate-zoom-in-soft"
              >
                {itemCount}
              </span>
            )}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-[#30251f] hover:bg-[#eee7dd] lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,400px)] border-l border-[#e5d9ca] bg-[#faf8f4] px-0 text-[#30251f]"
            >
              <SheetHeader className="border-b border-[#e8e0d5] px-7 pb-6 pt-8 text-left">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#a16b4e]">
                  Explore
                </span>
                <SheetTitle className="font-heading text-3xl font-medium text-[#30251f]">
                  {brand.name}
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col px-7 pt-5">
                {nav.links.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-[#e8e0d5] py-4 font-heading text-xl text-[#40342b] transition-colors hover:text-[#9a5639]"
                  >
                    <span>{link.label}</span>
                    <span className="text-[10px] font-sans tracking-widest text-[#ad9b89]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                ))}

                <Link
                  href="/track-order"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-[#e8e0d5] py-4 text-sm text-[#62564c] transition-colors hover:text-[#9a5639]"
                >
                  <Package className="h-4 w-4" />
                  Track your order
                  {hasRecent && (
                    <span className="ml-auto rounded-full bg-[#efe5d8] px-2 py-1 text-[10px] text-[#8f4932]">
                      {recentOrders.length} recent
                    </span>
                  )}
                </Link>

                {hasRecent && mostRecent && (
                  <Link
                    href={`/orders/${mostRecent.orderNumber}`}
                    onClick={() => setOpen(false)}
                    className="py-3 pl-7 text-xs text-[#8b7b6d] transition-colors hover:text-[#9a5639]"
                  >
                    Recent order · {mostRecent.orderNumber}
                  </Link>
                )}

                {nav.showPhone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="mt-7 flex items-center gap-3 text-sm text-[#62564c] transition-colors hover:text-[#9a5639]"
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
