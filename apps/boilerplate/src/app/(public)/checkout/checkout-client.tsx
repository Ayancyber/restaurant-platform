"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { saveRecentOrder } from "@/lib/hooks/use-recent-orders";
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
      <main className="min-h-[65vh] bg-[#faf8f4] px-5 py-24">
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#e8dfd3] bg-[#f1ebe2]">
            <ShoppingBag className="h-8 w-8 text-[#946047]" />
          </span>
          <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-[#a16b4e]">
            Your next meal awaits
          </p>
          <h1 className="mt-3 font-heading text-4xl font-medium tracking-tight text-[#30251f] sm:text-5xl">
            Your cart is empty.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#817469]">
            There is nothing here just yet. Explore the menu and find something
            worth coming back for.
          </p>
          <Button asChild className="mt-8 h-12 rounded-none bg-[#8f4932] px-7 text-xs uppercase tracking-[0.14em] hover:bg-[#713923]">
            <Link href="/menu">Explore the menu</Link>
          </Button>
        </div>
      </main>
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

      if (result.tracking_token) {
        saveRecentOrder({
          orderNumber: result.order_number,
          token: result.tracking_token,
          placedAt: Date.now(),
          total: Number(result.total) || 0,
        });
      }

      if (paymentMethod === "cod") {
        router.push(
          `/checkout/success?order=${result.order_number}&token=${result.tracking_token}`
        );
      } else {
        router.push(`/checkout/pay/${result.order_id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const orderTypes: { value: OrderType; label: string; detail: string }[] = [
    { value: "pickup", label: "Pickup", detail: "Collect your order" },
    { value: "delivery", label: "Delivery", detail: `+ ${currency} 150` },
    { value: "dine-in", label: "Dine-in", detail: "Enjoy at the restaurant" },
  ];

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#30251f]">
      <div className="mx-auto max-w-[1240px] px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <Link
          href="/menu"
          className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#8b7b6d] transition-colors hover:text-[#9a5639]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to menu
        </Link>

        <div className="mt-10 border-b border-[#e6ddd1] pb-9 sm:mt-14 sm:pb-12">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#a16b4e]">
            Your order · Almost there
          </p>
          <h1 className="mt-3 font-heading text-5xl font-medium leading-[1.05] tracking-tight text-[#30251f] sm:text-6xl lg:text-7xl">
            Almost at the table<span className="text-[#a65e40]">.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#817469]">
            A few details, and we'll get everything ready. Review your order
            and tell us how you'd like to enjoy it.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-16 lg:pt-14"
        >
          <div className="space-y-12">
            <section>
              <div className="mb-7 flex items-start gap-4 border-b border-[#e6ddd1] pb-4">
                <span className="font-heading text-2xl text-[#b17a59]">01</span>
                <div>
                  <h2 className="font-heading text-2xl font-medium">Your details</h2>
                  <p className="mt-1 text-xs text-[#8b7b6d]">
                    Where should we send your order updates?
                  </p>
                </div>
              </div>

              <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-xs font-medium text-[#55483e]">
                    Full name <span className="text-[#a65e40]">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    required
                    placeholder="Your full name"
                    className="h-12 rounded-none border-0 border-b border-[#d9cfc2] bg-transparent px-0 shadow-none placeholder:text-[#b5a99c] focus-visible:border-[#a65e40] focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone" className="text-xs font-medium text-[#55483e]">
                    Phone number <span className="text-[#a65e40]">*</span>
                  </Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    required
                    placeholder="+92 300 1234567"
                    className="h-12 rounded-none border-0 border-b border-[#d9cfc2] bg-transparent px-0 shadow-none placeholder:text-[#b5a99c] focus-visible:border-[#a65e40] focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customer_email" className="text-xs font-medium text-[#55483e]">
                    Email address <span className="font-normal text-[#9a8d80]">(optional)</span>
                  </Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 rounded-none border-0 border-b border-[#d9cfc2] bg-transparent px-0 shadow-none placeholder:text-[#b5a99c] focus-visible:border-[#a65e40] focus-visible:ring-0"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-7 flex items-start gap-4 border-b border-[#e6ddd1] pb-4">
                <span className="font-heading text-2xl text-[#b17a59]">02</span>
                <div>
                  <h2 className="font-heading text-2xl font-medium">How would you like it?</h2>
                  <p className="mt-1 text-xs text-[#8b7b6d]">
                    Choose how you'd like to receive your order.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {orderTypes.map((type) => {
                  const selected = orderType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setOrderType(type.value)}
                      className={`relative min-h-[112px] border p-5 text-left transition-all ${
                        selected
                          ? "border-[#9a5639] bg-[#f1e9df]"
                          : "border-[#e4dbcf] bg-transparent hover:border-[#b99a80]"
                      }`}
                    >
                      <span className={`mb-4 block h-3 w-3 rounded-full border ${
                        selected ? "border-[#9a5639] bg-[#9a5639] ring-2 ring-[#9a5639]/20" : "border-[#b7a99a]"
                      }`} />
                      <span className="block font-heading text-lg">{type.label}</span>
                      <span className="mt-1 block text-[11px] text-[#8b7b6d]">{type.detail}</span>
                    </button>
                  );
                })}
              </div>

              {orderType === "delivery" && (
                <div className="mt-7 space-y-2">
                  <Label htmlFor="delivery_address" className="text-xs font-medium text-[#55483e]">
                    Delivery address <span className="text-[#a65e40]">*</span>
                  </Label>
                  <Textarea
                    id="delivery_address"
                    name="delivery_address"
                    required
                    placeholder="House number, street, area, city"
                    rows={3}
                    className="resize-none rounded-none border-[#d9cfc2] bg-transparent shadow-none placeholder:text-[#b5a99c] focus-visible:border-[#a65e40] focus-visible:ring-0"
                  />
                </div>
              )}
            </section>

            <section>
              <div className="mb-7 flex items-start gap-4 border-b border-[#e6ddd1] pb-4">
                <span className="font-heading text-2xl text-[#b17a59]">03</span>
                <div>
                  <h2 className="font-heading text-2xl font-medium">Payment</h2>
                  <p className="mt-1 text-xs text-[#8b7b6d]">
                    Select your preferred payment method.
                  </p>
                </div>
              </div>

              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger className="h-12 rounded-none border-[#d9cfc2] bg-transparent shadow-none focus:ring-[#a65e40]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentConfig.methods.includes("jazzcash") &&
                    settings.paymentAccounts.jazzcash.enabled && (
                      <SelectItem value="jazzcash">
                        JazzCash — Pay via mobile wallet
                      </SelectItem>
                    )}
                  {paymentConfig.methods.includes("easypaisa") &&
                    settings.paymentAccounts.easypaisa.enabled && (
                      <SelectItem value="easypaisa">
                        Easypaisa — Pay via mobile wallet
                      </SelectItem>
                    )}
                  {paymentConfig.methods.includes("cod") &&
                    paymentConfig.codEnabled && (
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    )}
                </SelectContent>
              </Select>

              {paymentMethod !== "cod" && (
                <p className="mt-3 border-l-2 border-[#c69b75] pl-3 text-xs leading-6 text-[#817469]">
                  After placing your order, you'll see a QR code and account
                  number to complete your payment.
                </p>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-start gap-4 border-b border-[#e6ddd1] pb-4">
                <span className="font-heading text-2xl text-[#b17a59]">04</span>
                <div>
                  <h2 className="font-heading text-2xl font-medium">A note for the kitchen</h2>
                  <p className="mt-1 text-xs text-[#8b7b6d]">Anything we should know? (Optional)</p>
                </div>
              </div>
              <Textarea
                name="notes"
                placeholder="Special instructions, preferences or requests..."
                rows={3}
                className="resize-none rounded-none border-[#d9cfc2] bg-transparent shadow-none placeholder:text-[#b5a99c] focus-visible:border-[#a65e40] focus-visible:ring-0"
              />
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-[#e2d8cb] bg-[#f4efe8] p-6 sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#a16b4e]">
                Your selection
              </p>
              <h2 className="mt-2 font-heading text-2xl font-medium">
                Order summary
              </h2>
              <p className="mt-1 text-xs text-[#8b7b6d]">
                {items.length} {items.length === 1 ? "item" : "items"} in your order
              </p>

              <ul className="mt-7 space-y-5">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <Badge className="h-fit min-w-8 justify-center rounded-none border border-[#dfd2c3] bg-[#ebe2d7] px-2 py-1 text-[10px] text-[#6d5948] shadow-none hover:bg-[#ebe2d7]">
                        {item.quantity}×
                      </Badge>
                      <span className="line-clamp-2 text-sm leading-5 text-[#55483e]">
                        {item.name}
                      </span>
                    </div>
                    <span className="whitespace-nowrap text-sm font-medium text-[#30251f]">
                      {currency} {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-3 border-t border-[#ded3c6] pt-5 text-sm">
                <div className="flex justify-between text-[#817469]">
                  <span>Subtotal</span>
                  <span>{currency} {subtotal.toLocaleString()}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-[#817469]">
                    <span>Delivery</span>
                    <span>{currency} {deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-end justify-between border-t border-[#ded3c6] pt-5">
                  <span className="text-xs uppercase tracking-[0.15em] text-[#55483e]">
                    Total
                  </span>
                  <span className="font-heading text-2xl font-medium text-[#8f4932]">
                    {currency} {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-7 h-13 w-full gap-2 rounded-none bg-[#8f4932] text-xs font-medium uppercase tracking-[0.14em] text-white shadow-none transition-colors hover:bg-[#713923]"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing order...
                  </>
                ) : (
                  <>Place order · {currency} {total.toLocaleString()}</>
                )}
              </Button>

              <p className="mt-4 text-center text-[10px] leading-5 text-[#948577]">
                Please review your details before placing your order.
              </p>
            </div>

            <Link
              href="/menu"
              className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#8b7b6d] transition-colors hover:text-[#9a5639]"
            >
              <ArrowLeft className="h-3 w-3" />
              Continue browsing
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}
