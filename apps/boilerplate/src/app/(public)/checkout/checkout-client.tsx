"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import type { RestaurantConfig } from "@/config";

type OrderType = "pickup" | "delivery" | "dine-in";
type PaymentMethod = "jazzcash" | "easypaisa" | "cod";

export function CheckoutClient({ settings }: { settings: RestaurantConfig }) {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();
  const { currency, payment: paymentConfig } = settings;

  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    paymentConfig.codEnabled ? "cod" : "jazzcash"
  );

  const subtotal = getSubtotal();
  const deliveryFee = orderType === "delivery" ? 150 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-full bg-muted p-6 mx-auto w-fit">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-3xl font-bold mt-6">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add some items from the menu to continue.
        </p>
        <Button asChild className="mt-6">
          <Link href="/menu">Browse Menu</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      customer_name: formData.get("customer_name") as string,
      customer_phone: formData.get("customer_phone") as string,
      customer_email: formData.get("customer_email") as string,
      type: orderType,
      payment_method: paymentMethod,
      delivery_address:
        orderType === "delivery"
          ? (formData.get("delivery_address") as string)
          : "",
      notes: formData.get("notes") as string,
      items: items.map((item) => ({
        menu_item_id: item.id,
        item_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to place order");
        setSubmitting(false);
        return;
      }

      toast.success(`Order ${result.order_number} placed!`);
      clearCart();
      router.push(`/checkout/success?order=${result.order_number}`);
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/menu"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>

      <h1 className="font-heading text-3xl font-bold mb-8">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_400px]"
      >
        {/* LEFT — Details */}
        <div className="space-y-6">
          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    required
                    placeholder="Ahmed Khan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Phone *</Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    required
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email (optional)</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order type */}
          <Card>
            <CardHeader>
              <CardTitle>Order Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {(["pickup", "delivery", "dine-in"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`rounded-lg border-2 p-4 text-center transition-colors ${
                      orderType === t
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium capitalize">{t}</p>
                    {t === "delivery" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        + {currency} 150
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {orderType === "delivery" && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="delivery_address">Delivery Address *</Label>
                  <Textarea
                    id="delivery_address"
                    name="delivery_address"
                    required
                    placeholder="House #, Street, Area, City"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentConfig.methods.includes("jazzcash") && (
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                  )}
                  {paymentConfig.methods.includes("easypaisa") && (
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  )}
                  {paymentConfig.methods.includes("cod") && (
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {paymentMethod !== "cod" && (
                <p className="text-xs text-muted-foreground mt-3">
                  You'll be redirected to complete payment after placing the
                  order. (Payment gateway integration coming soon.)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                placeholder="Any special instructions?"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{item.quantity}×</Badge>
                      <span className="line-clamp-1">{item.name}</span>
                    </div>
                    <span className="whitespace-nowrap font-medium">
                      {currency}{" "}
                      {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {currency} {subtotal.toLocaleString()}
                  </span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {currency} {deliveryFee.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">
                    {currency} {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>Place Order — {currency} {total.toLocaleString()}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
