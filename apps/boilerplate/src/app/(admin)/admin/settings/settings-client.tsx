"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  Store,
  Phone,
  Clock,
  Share2,
  Search,
  CreditCard,
  Upload,
  ImageOff,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { RestaurantConfig } from "@/config";

export function SettingsClient({ initial }: { initial: RestaurantConfig }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [brand, setBrand] = useState(initial.brand);
  const [contact, setContact] = useState(initial.contact);
  const [hours, setHours] = useState(initial.hours);
  const [social, setSocial] = useState(initial.social);
  const [seo, setSeo] = useState(initial.seo);
  const [paymentAccounts, setPaymentAccounts] = useState(
    initial.paymentAccounts
  );
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);

  const [uploadingQr, setUploadingQr] = useState<
    "jazzcash" | "easypaisa" | null
  >(null);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          contact,
          hours,
          social,
          seo,
          paymentAccounts,
          whatsapp,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to save");
        return;
      }
      toast.success("Settings saved!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  function updateHour(index: number, field: string, value: string | boolean) {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  }

  async function handleQrUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    method: "jazzcash" | "easypaisa"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(method);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Upload failed");
        return;
      }
      setPaymentAccounts((prev) => ({
        ...prev,
        [method]: { ...prev[method], qrCodeUrl: result.url },
      }));
      toast.success("QR code uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload error");
    } finally {
      setUploadingQr(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Edit your restaurant's info — changes appear instantly on the site.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </header>

      <Tabs defaultValue="brand">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="brand" className="gap-2">
            <Store className="h-4 w-4" /> Brand
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4" /> Contact
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" /> Hours
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" /> Payments
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" /> Social
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={brand.name}
                  onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={brand.tagline}
                  onChange={(e) =>
                    setBrand({ ...brand, tagline: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroPunchline">Hero Punchline</Label>
                <Input
                  id="heroPunchline"
                  value={brand.heroPunchline}
                  onChange={(e) =>
                    setBrand({ ...brand, heroPunchline: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({ ...contact, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={contact.address}
                  onChange={(e) =>
                    setContact({ ...contact, address: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hours.map((h, i) => (
                <div
                  key={h.day}
                  className="grid grid-cols-[100px_1fr_1fr_auto] gap-3 items-center"
                >
                  <span className="text-sm font-medium">{h.day}</span>
                  <Input
                    type="time"
                    value={h.open}
                    disabled={h.closed}
                    onChange={(e) => updateHour(i, "open", e.target.value)}
                  />
                  <Input
                    type="time"
                    value={h.close}
                    disabled={h.closed}
                    onChange={(e) => updateHour(i, "close", e.target.value)}
                  />
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) =>
                        updateHour(i, "closed", e.target.checked)
                      }
                      className="rounded"
                    />
                    Closed
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS — NEW */}
        <TabsContent value="payments">
          <div className="space-y-6">
            {/* JazzCash */}
            <Card>
              <CardHeader>
                <CardTitle>JazzCash Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAccounts.jazzcash.enabled}
                    onChange={(e) =>
                      setPaymentAccounts({
                        ...paymentAccounts,
                        jazzcash: {
                          ...paymentAccounts.jazzcash,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  Accept JazzCash payments
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input
                      value={paymentAccounts.jazzcash.accountName}
                      onChange={(e) =>
                        setPaymentAccounts({
                          ...paymentAccounts,
                          jazzcash: {
                            ...paymentAccounts.jazzcash,
                            accountName: e.target.value,
                          },
                        })
                      }
                      placeholder="Muhammad Ayan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Account Number</Label>
                    <Input
                      value={paymentAccounts.jazzcash.accountNumber}
                      onChange={(e) =>
                        setPaymentAccounts({
                          ...paymentAccounts,
                          jazzcash: {
                            ...paymentAccounts.jazzcash,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                      placeholder="03001234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>QR Code (optional)</Label>
                  {paymentAccounts.jazzcash.qrCodeUrl ? (
                    <div className="relative w-48 h-48 rounded-md overflow-hidden bg-muted">
                      <img
                        src={paymentAccounts.jazzcash.qrCodeUrl}
                        alt="JazzCash QR"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQrUpload(e, "jazzcash")}
                      className="hidden"
                      disabled={uploadingQr === "jazzcash"}
                    />
                    <div className="w-48 h-10 inline-flex items-center justify-center gap-2 rounded-md border bg-background hover:bg-muted text-sm font-medium cursor-pointer">
                      {uploadingQr === "jazzcash" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {paymentAccounts.jazzcash.qrCodeUrl
                            ? "Replace QR"
                            : "Upload QR Code"}
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Easypaisa */}
            <Card>
              <CardHeader>
                <CardTitle>Easypaisa Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAccounts.easypaisa.enabled}
                    onChange={(e) =>
                      setPaymentAccounts({
                        ...paymentAccounts,
                        easypaisa: {
                          ...paymentAccounts.easypaisa,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  Accept Easypaisa payments
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input
                      value={paymentAccounts.easypaisa.accountName}
                      onChange={(e) =>
                        setPaymentAccounts({
                          ...paymentAccounts,
                          easypaisa: {
                            ...paymentAccounts.easypaisa,
                            accountName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Account Number</Label>
                    <Input
                      value={paymentAccounts.easypaisa.accountNumber}
                      onChange={(e) =>
                        setPaymentAccounts({
                          ...paymentAccounts,
                          easypaisa: {
                            ...paymentAccounts.easypaisa,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>QR Code (optional)</Label>
                  {paymentAccounts.easypaisa.qrCodeUrl ? (
                    <div className="relative w-48 h-48 rounded-md overflow-hidden bg-muted">
                      <img
                        src={paymentAccounts.easypaisa.qrCodeUrl}
                        alt="Easypaisa QR"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQrUpload(e, "easypaisa")}
                      className="hidden"
                      disabled={uploadingQr === "easypaisa"}
                    />
                    <div className="w-48 h-10 inline-flex items-center justify-center gap-2 rounded-md border bg-background hover:bg-muted text-sm font-medium cursor-pointer">
                      {uploadingQr === "easypaisa" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {paymentAccounts.easypaisa.qrCodeUrl
                            ? "Replace QR"
                            : "Upload QR Code"}
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  WhatsApp for Payment Proof
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsapp.enabled}
                    onChange={(e) =>
                      setWhatsapp({ ...whatsapp, enabled: e.target.checked })
                    }
                    className="rounded"
                  />
                  Send payment screenshots via WhatsApp
                </label>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={whatsapp.number}
                    onChange={(e) =>
                      setWhatsapp({ ...whatsapp, number: e.target.value })
                    }
                    placeholder="+92 300 1234567"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={social.instagram}
                  onChange={(e) =>
                    setSocial({ ...social, instagram: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={social.facebook}
                  onChange={(e) =>
                    setSocial({ ...social, facebook: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok URL</Label>
                <Input
                  id="tiktok"
                  value={social.tiktok}
                  onChange={(e) =>
                    setSocial({ ...social, tiktok: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Page Title</Label>
                <Input
                  id="seoTitle"
                  value={seo.title}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  rows={3}
                  value={seo.description}
                  onChange={(e) =>
                    setSeo({ ...seo, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
