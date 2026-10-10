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
      <div className="container mx-auto max-w-lg px-4 py-20">
        <div className="h-64 animate-pulse bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="text-center mb-8">
        <div className="mx-auto w-fit rounded-full bg-primary/10 p-4 mb-4">
          <Package className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Track Your Order</h1>
        <p className="text-muted-foreground mt-2">
          {recent.length > 0
            ? "Tap any order to see its live status."
            : "Orders placed on this device appear here automatically."}
        </p>
      </div>

      {recent.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Recent orders on this device
            </p>
            <button
              type="button"
              onClick={() => clearRecentOrders()}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear
            </button>
          </div>

          {recent.map((o) => (
            <button
              key={o.token}
              type="button"
              onClick={() => goToOrder(o.token)}
              className="w-full rounded-lg border p-3 text-left hover:border-primary transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {o.orderNumber}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(o.placedAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium">
                  {settings.currency} {o.total.toLocaleString()}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-fit rounded-full bg-muted p-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No recent orders on this device</p>
              <p className="text-sm text-muted-foreground mt-1">
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

      <p className="text-center text-sm text-muted-foreground mt-8">
        Ordered on a different device?{" "}
        <a
          href={`tel:${settings.contact.phone}`}
          className="text-primary hover:underline"
        >
          Call us at {settings.contact.phone}
        </a>
      </p>
    </div>
  );
}
