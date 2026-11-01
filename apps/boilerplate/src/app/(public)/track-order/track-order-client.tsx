"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RestaurantConfig } from "@/config";
import {
  useRecentOrders,
  clearRecentOrders,
} from "@/lib/hooks/use-recent-orders";

export function TrackOrderClient({ settings }: { settings: RestaurantConfig }) {
  const router = useRouter();
  const { orders: recent, mounted } = useRecentOrders();

  function goToOrder(token: string) {
    router.push(`/orders/${token}`);
  }

  if (!mounted) {
    return (
      <main className="min-h-[70vh] bg-[#faf8f4] px-5 py-20"><div className="mx-auto max-w-lg">
        <div className="h-64 animate-pulse rounded-none border border-[#e6ddd1] bg-[#f1ebe2]" />
      </div></main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#faf8f4] px-5 py-12 text-[#30251f] sm:py-16"><div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#8b7b6d] transition-colors hover:text-[#9a5639]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="mb-12 border-b border-[#e6ddd1] pb-9 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#e2d8cb] bg-[#f1e9df]">
          <Package className="h-8 w-8 text-[#8f4932]" strokeWidth={1.4} />
        </div>
        <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">Your orders<span className="text-[#a65e40]">.</span></h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#817469]">
          {recent.length > 0
            ? "Tap any order to see its live status."
            : "Orders placed on this device appear here automatically."}
        </p>
      </div>

      {recent.length > 0 ? (
        <div className="space-y-3">
          <div className="mb-4 flex items-center justify-between border-b border-[#e6ddd1] pb-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8b7b6d]">
              Recent orders on this device
            </p>
            <button
              type="button"
              onClick={() => clearRecentOrders()}
              className="text-[10px] uppercase tracking-[0.12em] text-[#9a5639] transition-colors hover:text-red-700"
            >
              Clear
            </button>
          </div>

          {recent.map((o) => (
            <button
              key={o.token}
              type="button"
              onClick={() => goToOrder(o.token)}
              className="flex w-full items-center justify-between gap-4 border-b border-[#e6ddd1] bg-transparent px-2 py-5 text-left transition-colors hover:bg-[#f4efe8]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {o.orderNumber}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-[#8b7b6d]">
                  {new Date(o.placedAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-[#55483e]">
                  {settings.currency} {o.total.toLocaleString()}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card className="rounded-none border-[#e2d8cb] bg-[#f4efe8] shadow-none">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#e2d8cb] bg-[#ebe2d7]">
              <Package className="h-7 w-7 text-[#8f4932]" />
            </div>
            <div>
              <p className="font-heading text-2xl font-medium">No orders just yet.</p>
              <p className="mt-2 text-sm leading-6 text-[#817469]">
                Place an order and it will show up here so you can track it
                anytime.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/menu">
                Browse Menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="mt-10 text-center text-xs leading-6 text-[#8b7b6d]">
        Ordered on a different device?{" "}
        <a
          href={`tel:${settings.contact.phone}`}
          className="font-medium text-[#8f4932] underline underline-offset-4"
        >
          Call us at {settings.contact.phone}
        </a>
      </p>
    </div></main>
  );
}
