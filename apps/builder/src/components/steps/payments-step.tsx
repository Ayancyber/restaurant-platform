"use client";

import { useEffect, useRef, useState } from "react";
import { useWizardStore } from "@/lib/store/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Upload,
  X,
  Image as ImageIcon,
  MessageCircle,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";

type Method = "jazzcash" | "easypaisa";

export function PaymentsStep() {
  const { data, updateData, _hasHydrated } = useWizardStore();
  const [mounted, setMounted] = useState(false);
  const [local, setLocal] = useState(data.paymentAccounts);
  const [whatsapp, setWhatsapp] = useState(data.whatsapp);

  const jazzcashInput = useRef<HTMLInputElement>(null);
  const easypaisaInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    setLocal(data.paymentAccounts);
    setWhatsapp(data.whatsapp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  function persist(next: typeof local, wa = whatsapp) {
    setLocal(next);
    updateData("paymentAccounts", next);
    if (wa !== whatsapp) {
      setWhatsapp(wa);
      updateData("whatsapp", wa);
    }
  }

  function updateMethod(
    method: Method | "cod",
    patch: Partial<typeof local.jazzcash> | { enabled: boolean }
  ) {
    const next = {
      ...local,
      [method]: { ...(local[method] as object), ...patch },
    };
    persist(next as typeof local);
  }

  function handleQrUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    method: Method
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error("QR image must be under 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateMethod(method, { qrCodeDataUrl: reader.result as string });
      toast.success("QR code uploaded");
    };
    reader.readAsDataURL(file);
  }

  function removeQr(method: Method) {
    updateMethod(method, { qrCodeDataUrl: "" });
    const ref = method === "jazzcash" ? jazzcashInput : easypaisaInput;
    if (ref.current) ref.current.value = "";
  }

  if (!mounted || !_hasHydrated) {
    return <div className="h-96 animate-pulse bg-muted rounded-md" />;
  }

  return (
    <div className="space-y-6">
      {/* JazzCash */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            JazzCash
          </CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="jazzcash-enabled"
              checked={local.jazzcash.enabled}
              onCheckedChange={(v) =>
                updateMethod("jazzcash", { enabled: v === true })
              }
            />
            <Label htmlFor="jazzcash-enabled" className="text-sm cursor-pointer">
              Accept JazzCash
            </Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input
                value={local.jazzcash.accountName}
                onChange={(e) =>
                  updateMethod("jazzcash", { accountName: e.target.value })
                }
                placeholder="Muhammad Ayan"
                disabled={!local.jazzcash.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile Account Number</Label>
              <Input
                value={local.jazzcash.accountNumber}
                onChange={(e) =>
                  updateMethod("jazzcash", { accountNumber: e.target.value })
                }
                placeholder="03001234567"
                disabled={!local.jazzcash.enabled}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>QR Code (optional)</Label>
            {local.jazzcash.qrCodeDataUrl ? (
              <div className="flex items-center gap-4">
                <div className="h-28 w-28 rounded-md bg-muted overflow-hidden shrink-0 border">
                  <img
                    src={local.jazzcash.qrCodeDataUrl}
                    alt="JazzCash QR"
                    className="h-full w-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQr("jazzcash")}
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> Remove
                </Button>
              </div>
            ) : (
              <div className="h-28 w-28 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
            <input
              ref={jazzcashInput}
              type="file"
              accept="image/*"
              onChange={(e) => handleQrUpload(e, "jazzcash")}
              className="hidden"
              disabled={!local.jazzcash.enabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => jazzcashInput.current?.click()}
              disabled={!local.jazzcash.enabled}
            >
              <Upload className="h-4 w-4" />
              {local.jazzcash.qrCodeDataUrl ? "Replace QR" : "Upload QR"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Easypaisa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Easypaisa
          </CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="easypaisa-enabled"
              checked={local.easypaisa.enabled}
              onCheckedChange={(v) =>
                updateMethod("easypaisa", { enabled: v === true })
              }
            />
            <Label htmlFor="easypaisa-enabled" className="text-sm cursor-pointer">
              Accept Easypaisa
            </Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input
                value={local.easypaisa.accountName}
                onChange={(e) =>
                  updateMethod("easypaisa", { accountName: e.target.value })
                }
                placeholder="Muhammad Ayan"
                disabled={!local.easypaisa.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile Account Number</Label>
              <Input
                value={local.easypaisa.accountNumber}
                onChange={(e) =>
                  updateMethod("easypaisa", { accountNumber: e.target.value })
                }
                placeholder="03001234567"
                disabled={!local.easypaisa.enabled}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>QR Code (optional)</Label>
            {local.easypaisa.qrCodeDataUrl ? (
              <div className="flex items-center gap-4">
                <div className="h-28 w-28 rounded-md bg-muted overflow-hidden shrink-0 border">
                  <img
                    src={local.easypaisa.qrCodeDataUrl}
                    alt="Easypaisa QR"
                    className="h-full w-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQr("easypaisa")}
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> Remove
                </Button>
              </div>
            ) : (
              <div className="h-28 w-28 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
            <input
              ref={easypaisaInput}
              type="file"
              accept="image/*"
              onChange={(e) => handleQrUpload(e, "easypaisa")}
              className="hidden"
              disabled={!local.easypaisa.enabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => easypaisaInput.current?.click()}
              disabled={!local.easypaisa.enabled}
            >
              <Upload className="h-4 w-4" />
              {local.easypaisa.qrCodeDataUrl ? "Replace QR" : "Upload QR"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cash on Delivery */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Banknote className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Cash on Delivery / Pickup</p>
            <p className="text-sm text-muted-foreground">
              Customers pay in cash when they receive the order or pick it up.
            </p>
          </div>
          <Checkbox
            checked={local.cod.enabled}
            onCheckedChange={(v) =>
              updateMethod("cod", { enabled: v === true })
            }
          />
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            WhatsApp for Payment Proof
          </CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="wa-enabled"
              checked={whatsapp.enabled}
              onCheckedChange={(v) => {
                const next = { ...whatsapp, enabled: v === true };
                persist(local, next);
              }}
            />
            <Label htmlFor="wa-enabled" className="text-sm cursor-pointer">
              Enable
            </Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input
              value={whatsapp.number}
              onChange={(e) =>
                persist(local, { ...whatsapp, number: e.target.value })
              }
              placeholder="+92 300 1234567"
              disabled={!whatsapp.enabled}
            />
            <p className="text-xs text-muted-foreground">
              Customers send payment screenshots here after ordering.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground font-normal">
            Preview — Payment methods visible on checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {local.jazzcash.enabled && (
              <Badge variant="secondary">JazzCash</Badge>
            )}
            {local.easypaisa.enabled && (
              <Badge variant="secondary">Easypaisa</Badge>
            )}
            {local.cod.enabled && <Badge variant="secondary">Cash on Delivery</Badge>}
            {!local.jazzcash.enabled &&
              !local.easypaisa.enabled &&
              !local.cod.enabled && (
                <p className="text-sm text-muted-foreground">
                  No payment methods enabled — customers won't be able to order.
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
