"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RestaurantConfig } from "@/config";
import { saveRecentOrder } from "@/lib/hooks/use-recent-orders";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "out-for-delivery"
  | "delivered"
  | "completed"
  | "cancelled";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  type: "pickup" | "delivery" | "dine-in";
  status: OrderStatus;
  payment_method: "jazzcash" | "easypaisa" | "cod";
  payment_status: "unpaid" | "paid" | "failed" | "refunded";
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItem = {
  id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

const STATUS_STEPS: {
  key: OrderStatus;
  label: string;
  description: string;
  icon: typeof Clock;
  matches: OrderStatus[];
}[] = [
  {
    key: "pending",
    label: "Order Placed",
    description: "We received your order",
    icon: ShoppingBag,
    matches: ["pending"],
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "The restaurant confirmed your order",
    icon: CheckCircle2,
    matches: ["confirmed"],
  },
  {
    key: "preparing",
    label: "Preparing",
    description: "Your food is being prepared",
    icon: UtensilsCrossed,
    matches: ["preparing"],
  },
  {
    key: "ready",
    label: "Ready",
    description: "Your order is ready",
    icon: Package,
    matches: ["ready"],
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your order is on the way",
    icon: Truck,
    matches: ["out_for_delivery", "out-for-delivery"],
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Enjoy your meal!",
    icon: Truck,
    matches: ["delivered", "completed"],
  },
];

function getActiveIndex(status: OrderStatus): number {
  for (let i = 0; i < STATUS_STEPS.length; i++) {
    if (STATUS_STEPS[i].matches.includes(status)) return i;
  }
  return 0;
}

export function OrderTrackingClient({
  order: initialOrder,
  items: initialItems,
  settings,
  token,
}: {
  order: Order;
  items: OrderItem[];
  settings: RestaurantConfig;
  token: string;
}) {
  const { currency, brand, whatsapp } = settings;
  const [order, setOrder] = useState(initialOrder);

  // Save this order to localStorage so user can find it again
  useEffect(() => {
    saveRecentOrder({
      orderNumber: order.order_number,
      token,
      placedAt: new Date(order.created_at).getTime(),
      total: Number(order.total),
    });
  }, [order.order_number, order.created_at, order.total, token]);
  const [items, setItems] = useState(initialItems);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Auto-poll every 10s while order isn't finished
  useEffect(() => {
    const isFinished =
      order.status === "delivered" ||
      order.status === "completed" ||
      order.status === "cancelled";

    if (isFinished) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          setItems(data.items ?? []);
          setLastChecked(new Date());
        }
      } catch {
        // Silent — will retry next interval
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [order.status, order.id]);

  if (order.status === "cancelled") {
    return (
      <main className="min-h-[70vh] bg-[#faf8f4] px-5 py-16 text-[#30251f]"><div className="mx-auto max-w-3xl">
        <Card className="rounded-none border border-red-200 bg-[#f4efe8] shadow-none">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-fit rounded-full bg-destructive/10 p-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="font-heading text-3xl font-bold mt-6">
              Order Cancelled
            </h1>
            <p className="mt-3 text-xs leading-6 text-[#8b7b6d]">
              Order {order.order_number} was cancelled.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/menu">Browse Menu</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div></main>
    );
  }

  const activeIndex = getActiveIndex(order.status);
  const currentStep = STATUS_STEPS[activeIndex];

  const methodLabel =
    order.payment_method === "jazzcash"
      ? "JazzCash"
      : order.payment_method === "easypaisa"
        ? "Easypaisa"
        : "Cash on Delivery";

  const whatsappLink = whatsapp.enabled
    ? `https://wa.me/${whatsapp.number.replace(
        /[^0-9]/g,
        ""
      )}?text=${encodeURIComponent(
        `Hi ${brand.name}! I have a question about my order ${order.order_number}.`
      )}`
    : null;

  const createdDate = new Date(order.created_at);
  const updatedDate = new Date(order.updated_at);

  const isFinished =
    order.status === "delivered" || order.status === "completed";

  return (
    <main className="min-h-screen bg-[#faf8f4] px-5 py-10 text-[#30251f] sm:py-14"><div className="mx-auto max-w-4xl">
      <Link
        href="/"
        className="mb-9 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#8b7b6d] transition-colors hover:text-[#9a5639]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">On its way<span className="text-[#a65e40]">.</span></h1>
          <Badge variant="secondary" className="rounded-none border border-[#e2d8cb] bg-[#f1e9df] font-mono text-xs text-[#8f4932]">
            {order.order_number}
          </Badge>
        </div>
        <p className="mt-3 text-xs leading-6 text-[#8b7b6d]">
          Placed on{" "}
          {createdDate.toLocaleString("en-PK", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Live status banner */}
      <Card className="mb-7 rounded-none border border-[#d9c7b5] bg-[#f1e9df] shadow-none">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#d9c7b5] bg-[#e8d9c9] text-[#8f4932]">
            <currentStep.icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f4932]">
              Current Status
            </p>
            <p className="font-heading text-2xl font-medium sm:text-3xl">
              {currentStep.label}
            </p>
            <p className="mt-1 text-sm text-[#817469]">
              {currentStep.description}
            </p>
          </div>
          {!isFinished && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Live
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="mb-7 rounded-none border-[#e2d8cb] bg-[#f4efe8] shadow-none">
        <CardHeader className="border-b border-[#e2d8cb] pb-4">
          <CardTitle className="font-heading text-xl font-medium">Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx < activeIndex;
              const isActive = idx === activeIndex;
              const isUpcoming = idx > activeIndex;

              return (
                <li key={step.key} className="flex gap-4 relative">
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`absolute left-[19px] top-10 w-0.5 h-full ${
                        isDone ? "bg-primary" : "bg-border"
                      }`}
                      aria-hidden
                    />
                  )}

                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-colors ${
                      isDone
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="pb-6">
                    <p
                      className={`font-medium ${
                        isUpcoming ? "text-muted-foreground" : ""
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-sm text-[#817469]">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Order details */}
      <Card className="mb-7 rounded-none border-[#e2d8cb] bg-[#f4efe8] shadow-none">
        <CardHeader className="border-b border-[#e2d8cb] pb-4">
          <CardTitle className="font-heading text-xl font-medium">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <div className="flex gap-3">
                  <Badge variant="secondary" className="shrink-0">
                    {item.quantity}×
                  </Badge>
                  <span>{item.item_name}</span>
                </div>
                <span className="font-medium whitespace-nowrap">
                  {currency} {Number(item.line_total).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          <div className="my-5 border-t border-[#ded3c6]" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#817469]">Subtotal</span>
              <span>
                {currency} {Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            {Number(order.delivery_fee) > 0 && (
              <div className="flex justify-between">
                <span className="text-[#817469]">Delivery</span>
                <span>
                  {currency} {Number(order.delivery_fee).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-[#8f4932]">
                {currency} {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info row */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <Card className="rounded-none border-[#e2d8cb] bg-[#f4efe8] shadow-none">
          <CardContent className="p-5 space-y-3 text-sm">
            <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
              Order Info
            </p>
            <div className="flex justify-between">
              <span className="text-[#817469]">Type</span>
              <span className="capitalize">{order.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#817469]">Payment</span>
              <span>{methodLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#817469]">Status</span>
              <Badge
                variant={
                  order.payment_status === "paid" ? "default" : "secondary"
                }
                className="capitalize"
              >
                {order.payment_status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-[#e2d8cb] bg-[#f4efe8] shadow-none">
          <CardContent className="p-5 space-y-3 text-sm">
            <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
              Contact
            </p>
            <div className="flex justify-between">
              <span className="text-[#817469]">Name</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#817469]">Phone</span>
              <span className="rounded-none border border-[#e2d8cb] bg-[#f1e9df] font-mono text-xs text-[#8f4932]">{order.customer_phone}</span>
            </div>
            {order.delivery_address && (
              <div className="pt-2 border-t">
                <p className="text-xs text-[#8b7b6d]">
                  Delivery Address
                </p>
                <p className="mt-1">{order.delivery_address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {order.notes && (
        <Card className="mb-7 rounded-none border-[#e2d8cb] bg-[#f4efe8] shadow-none">
          <CardContent className="p-5 text-sm">
            <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Notes
            </p>
            <p className="italic">&quot;{order.notes}&quot;</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {whatsappLink && (
          <Button
            asChild
            size="lg"
            className="h-12 flex-1 gap-2 rounded-none bg-[#536b52] text-xs uppercase tracking-[0.12em] hover:bg-[#40553f]"
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" />
              Message Us on WhatsApp
            </a>
          </Button>
        )}
        <Button asChild variant="outline" size="lg" className="h-12 gap-2 rounded-none border-[#d9cfc2] bg-transparent text-xs uppercase tracking-[0.12em] text-[#55483e] hover:bg-[#f1e9df]">
          <a href={`tel:${settings.contact.phone}`}>
            <Phone className="h-4 w-4" />
            Call Restaurant
          </a>
        </Button>
      </div>

      <p className="mt-7 text-center text-[10px] leading-6 tracking-wide text-[#8b7b6d]">
        {isFinished ? (
          <>
            Completed at{" "}
            {updatedDate.toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </>
        ) : (
          <>
            Auto-refreshes every 10s • Last checked{" "}
            {lastChecked.toLocaleTimeString("en-PK", {
              timeStyle: "short",
            })}
          </>
        )}
      </p>
    </div></main>
  );
}
