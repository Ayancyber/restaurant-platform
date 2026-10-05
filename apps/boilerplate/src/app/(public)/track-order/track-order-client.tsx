"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { RestaurantConfig } from "@/config";
import {
  useRecentOrders,
  clearRecentOrders,
} from "@/lib/hooks/use-recent-orders";

export function TrackOrderClient({ settings }: { settings: RestaurantConfig }) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [checking, setChecking] = useState(false);
  const { orders: recent, mounted } = useRecentOrders();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = orderNumber.trim().toUpperCase();

    if (!trimmed) {
      toast.error("Please enter your order number");
      return;
    }

    setChecking(true);

    try {
      const res = await fetch(
        `/api/orders/find/${encodeURIComponent(trimmed)}`
      );
      if (res.ok) {
        router.push(`/orders/${trimmed}`);
      } else if (res.status === 404) {
        toast.error("Order not found. Check the number and try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setChecking(false);
    }
  }

  function goToRecent(num: string) {
    router.push(`/orders/${num}`);
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
          Enter your order number to see live status.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ORD-20261005-0011"
                className="font-mono"
                autoComplete="off"
                autoCapitalize="characters"
              />
              <p className="text-xs text-muted-foreground">
                Found on your order confirmation screen or in WhatsApp
                messages.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={checking || !orderNumber.trim()}
            >
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find My Order
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Recent orders on this device
            </p>
            <button
              type="button"
              onClick={() => clearRecentOrders()}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2">
            {recent.map((o) => (
              <button
                key={o.orderNumber}
                type="button"
                onClick={() => goToRecent(o.orderNumber)}
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
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-8">
        Can&apos;t find your order?{" "}
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
