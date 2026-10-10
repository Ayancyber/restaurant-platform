"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Phone,
  QrCode,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { RestaurantConfig } from "@/config";

type Order = {
  id: string;
  order_number: string;
  tracking_token: string | null;
  customer_name: string;
  customer_phone: string;
  payment_method: "jazzcash" | "easypaisa" | "cod";
  payment_status: "unpaid" | "paid" | "failed" | "refunded";
  total: number;
  status: string;
  customer_marked_paid_at: string | null;
};

export function PaymentClient({
  order,
  settings,
}: {
  order: Order;
  settings: RestaurantConfig;
}) {
  const { currency, paymentAccounts, whatsapp, brand } = settings;
  const [marking, setMarking] = useState(false);
  const [markedPaid, setMarkedPaid] = useState(!!order.customer_marked_paid_at);
  const [copied, setCopied] = useState(false);

  const account =
    order.payment_method === "jazzcash"
      ? paymentAccounts.jazzcash
      : paymentAccounts.easypaisa;

  const methodLabel =
    order.payment_method === "jazzcash" ? "JazzCash" : "Easypaisa";

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      toast.success("Account number copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long press the number");
    }
  }

  async function markAsPaid() {
    setMarking(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/notify-paid`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to notify");
        return;
      }
      setMarkedPaid(true);
      toast.success("Restaurant has been notified!");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setMarking(false);
    }
  }

  const whatsappLink = whatsapp.enabled
    ? `https://wa.me/${whatsapp.number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hi ${brand.name}! I've paid for order ${order.order_number}. Total: ${currency} ${order.total.toLocaleString()}. Sending payment screenshot now.`
      )}`
    : null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto w-fit rounded-full bg-primary/10 p-4 mb-4">
          <QrCode className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold">
          Complete Your Payment
        </h1>
        <p className="mt-3 text-muted-foreground">
          Order <span className="font-mono font-medium text-foreground">{order.order_number}</span> placed successfully
        </p>
      </div>

      {markedPaid && (
        <Card className="mb-6 border-green-500/30 bg-green-500/5">
          <CardContent className="p-5 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                Payment notification sent
              </p>
              <p className="text-sm text-muted-foreground">
                The restaurant will verify your payment and prepare your order.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Amount to Pay</span>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {methodLabel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary">
              {currency} {Number(order.total).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {account.qrCodeUrl ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={account.qrCodeUrl}
                alt={`${methodLabel} QR Code`}
                className="w-64 h-64 object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Open your {methodLabel} app → Scan QR → Enter PKR{" "}
              {Number(order.total).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Or Send to Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Account Holder</p>
            <p className="font-medium">{account.accountName}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {methodLabel} Mobile Account Number
            </p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-lg font-semibold flex-1">
                {account.accountNumber}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={copyAccount}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <p className="font-medium">⚠️ Important</p>
            <p className="text-muted-foreground">
              Enter <span className="font-mono font-medium text-foreground">{order.order_number}</span> in
              the payment reference field (if available), so the restaurant can
              match your payment.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>After Paying</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {whatsappLink && !markedPaid && (
            <Button
              asChild
              size="lg"
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Send Screenshot on WhatsApp
              </a>
            </Button>
          )}

          {!markedPaid ? (
            <Button
              onClick={markAsPaid}
              size="lg"
              variant="default"
              className="w-full gap-2"
              disabled={marking}
            >
              {marking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  I've Paid — Notify {brand.name}
                </>
              )}
            </Button>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Payment notification sent. The restaurant will verify shortly.
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2">
            <Phone className="h-4 w-4" />
            <span>Or call us at</span>
            <a
              href={`tel:${settings.contact.phone}`}
              className="font-medium text-foreground hover:text-primary"
            >
              {settings.contact.phone}
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-3">
        <Button asChild variant="outline">
          <Link href={`/orders/${order.tracking_token ?? order.order_number}`}>
            Track Your Order <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <div>
          <Link
            href="/menu"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
