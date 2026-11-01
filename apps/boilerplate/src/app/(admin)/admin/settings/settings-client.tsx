"use client";

import { useRef, useState } from "react";
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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Please choose a PNG, JPG, or WebP image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5MB");
      e.target.value = "";
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Logo upload failed");
        return;
      }

      setBrand((prev) => ({ ...prev, logoUrl: result.url }));
      toast.success("Logo uploaded. Save changes to publish it.");
    } catch (err) {
      console.error(err);
      toast.error("Logo upload error");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

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
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Workspace / Configuration
          </p>
          <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
            Settings<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Shape the details behind your restaurant's online presence.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-11 gap-2 self-start px-5 sm:self-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </header>

      <Tabs defaultValue="brand" className="grid gap-8 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-3 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:block">
            Configuration
          </p>
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0 md:flex-col md:items-stretch md:overflow-visible">
            <TabsTrigger value="brand" className="h-10 shrink-0 justify-start gap-3 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-muted/60 data-[state=active]:text-primary data-[state=active]:shadow-none md:w-full md:border-b-0 md:border-l-2 md:data-[state=active]:border-l-primary">
              <Store className="h-4 w-4" /> Brand
            </TabsTrigger>
            <TabsTrigger value="contact" className="h-10 shrink-0 justify-start gap-3 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-muted/60 data-[state=active]:text-primary data-[state=active]:shadow-none md:w-full md:border-b-0 md:border-l-2 md:data-[state=active]:border-l-primary">
              <Phone className="h-4 w-4" /> Contact
            </TabsTrigger>
            <TabsTrigger value="hours" className="h-10 shrink-0 justify-start gap-3 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-muted/60 data-[state=active]:text-primary data-[state=active]:shadow-none md:w-full md:border-b-0 md:border-l-2 md:data-[state=active]:border-l-primary">
              <Clock className="h-4 w-4" /> Opening hours
            </TabsTrigger>
            <TabsTrigger value="payments" className="h-10 shrink-0 justify-start gap-3 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-muted/60 data-[state=active]:text-primary data-[state=active]:shadow-none md:w-full md:border-b-0 md:border-l-2 md:data-[state=active]:border-l-primary">
              <CreditCard className="h-4 w-4" /> Payments
            </TabsTrigger>
            <TabsTrigger value="social" className="h-10 shrink-0 justify-start gap-3 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-muted/60 data-[state=active]:text-primary data-[state=active]:shadow-none md:w-full md:border-b-0 md:border-l-2 md:data-[state=active]:border-l-primary">
              <Share2 className="h-4 w-4" /> Social links
            </TabsTrigger>
            <TabsTrigger value="seo" className="h-10 shrink-0 justify-start gap-3 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-muted/60 data-[state=active]:text-primary data-[state=active]:shadow-none md:w-full md:border-b-0 md:border-l-2 md:data-[state=active]:border-l-primary">
              <Search className="h-4 w-4" /> SEO
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 hidden border-t border-border/70 pt-5 md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              A note
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Remember to save your changes before leaving this page.
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <TabsContent value="brand" className="mt-0 space-y-6">
            <section className="border-b border-border/70 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">01 / Identity</p>
              <h2 className="mt-2 font-heading text-2xl font-medium">Brand identity</h2>
              <p className="mt-1 text-sm text-muted-foreground">The name and words guests see across your website.</p>
            </section>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Restaurant logo</Label>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
                    {brand.logoUrl && brand.logoUrl !== "/logo.svg" ? (
                      <img
                        src={brand.logoUrl}
                        alt="Restaurant logo preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <ImageOff className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploadingLogo ? "Uploading..." : brand.logoUrl && brand.logoUrl !== "/logo.svg" ? "Replace logo" : "Upload logo"}
                    </Button>
                    {brand.logoUrl && brand.logoUrl !== "/logo.svg" && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setBrand((prev) => ({ ...prev, logoUrl: "/logo.svg" }))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, or WebP • Max 5MB. Changes take effect after saving.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant name *</Label>
                <Input id="name" value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} className="h-11" />
                <p className="text-xs text-muted-foreground">A short line that captures your restaurant's character.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroPunchline">Hero punchline</Label>
                <Input id="heroPunchline" value={brand.heroPunchline} onChange={(e) => setBrand({ ...brand, heroPunchline: e.target.value })} className="h-11" />
                <p className="text-xs text-muted-foreground">The prominent statement displayed in your homepage hero.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-0 space-y-6">
            <section className="border-b border-border/70 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">02 / Get in touch</p>
              <h2 className="mt-2 font-heading text-2xl font-medium">Contact information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Make it easy for guests to reach your restaurant.</p>
            </section>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Restaurant address</Label>
                <Textarea id="address" rows={3} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className="resize-y" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="mt-0 space-y-6">
            <section className="border-b border-border/70 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">03 / Schedule</p>
              <h2 className="mt-2 font-heading text-2xl font-medium">Opening hours</h2>
              <p className="mt-1 text-sm text-muted-foreground">Set the hours your guests can visit each day.</p>
            </section>
            <div className="space-y-0">
              {hours.map((h, i) => (
                <div key={h.day} className="grid grid-cols-1 gap-3 border-b border-border/70 py-4 sm:grid-cols-[minmax(100px,0.7fr)_1fr_1fr_auto] sm:items-center">
                  <span className="text-sm font-medium">{h.day}</span>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-normal text-muted-foreground">Opens</Label>
                    <Input type="time" value={h.open} disabled={h.closed} onChange={(e) => updateHour(i, "open", e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-normal text-muted-foreground">Closes</Label>
                    <Input type="time" value={h.close} disabled={h.closed} onChange={(e) => updateHour(i, "close", e.target.value)} className="h-10" />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 pt-4 text-xs text-muted-foreground sm:pt-0">
                    <input type="checkbox" checked={h.closed} onChange={(e) => updateHour(i, "closed", e.target.checked)} className="h-4 w-4 rounded accent-primary" />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-0 space-y-8">
            <section className="border-b border-border/70 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">04 / Checkout</p>
              <h2 className="mt-2 font-heading text-2xl font-medium">Payment methods</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage mobile wallet details and payment proof instructions.</p>
            </section>

            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-heading text-xl">JazzCash</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Mobile wallet payment details</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={paymentAccounts.jazzcash.enabled} onChange={(e) => setPaymentAccounts({ ...paymentAccounts, jazzcash: { ...paymentAccounts.jazzcash, enabled: e.target.checked } })} className="h-4 w-4 rounded accent-primary" />
                  Accept JazzCash payments
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account holder name</Label>
                  <Input value={paymentAccounts.jazzcash.accountName} onChange={(e) => setPaymentAccounts({ ...paymentAccounts, jazzcash: { ...paymentAccounts.jazzcash, accountName: e.target.value } })} className="h-11" placeholder="Account holder name" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile account number</Label>
                  <Input value={paymentAccounts.jazzcash.accountNumber} onChange={(e) => setPaymentAccounts({ ...paymentAccounts, jazzcash: { ...paymentAccounts.jazzcash, accountNumber: e.target.value } })} className="h-11" placeholder="03XXXXXXXXX" />
                </div>
              </div>
              <div className="space-y-3">
                <Label>QR code (optional)</Label>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/30">
                    {paymentAccounts.jazzcash.qrCodeUrl ? (
                      <img src={paymentAccounts.jazzcash.qrCodeUrl} alt="JazzCash QR" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageOff className="mx-auto h-7 w-7" strokeWidth={1.2} />
                        <span className="mt-2 block text-[10px]">No QR uploaded</span>
                      </div>
                    )}
                  </div>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, "jazzcash")} className="hidden" disabled={uploadingQr === "jazzcash"} />
                    <span className="inline-flex h-10 items-center justify-center gap-2 border border-border px-4 text-xs font-medium transition-colors hover:bg-muted">
                      {uploadingQr === "jazzcash" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingQr === "jazzcash" ? "Uploading..." : paymentAccounts.jazzcash.qrCodeUrl ? "Replace QR code" : "Upload QR code"}
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-5 border-t border-border/70 pt-7">
              <div className="flex flex-col justify-between gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-heading text-xl">Easypaisa</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Mobile wallet payment details</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={paymentAccounts.easypaisa.enabled} onChange={(e) => setPaymentAccounts({ ...paymentAccounts, easypaisa: { ...paymentAccounts.easypaisa, enabled: e.target.checked } })} className="h-4 w-4 rounded accent-primary" />
                  Accept Easypaisa payments
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account holder name</Label>
                  <Input value={paymentAccounts.easypaisa.accountName} onChange={(e) => setPaymentAccounts({ ...paymentAccounts, easypaisa: { ...paymentAccounts.easypaisa, accountName: e.target.value } })} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile account number</Label>
                  <Input value={paymentAccounts.easypaisa.accountNumber} onChange={(e) => setPaymentAccounts({ ...paymentAccounts, easypaisa: { ...paymentAccounts.easypaisa, accountNumber: e.target.value } })} className="h-11" />
                </div>
              </div>
              <div className="space-y-3">
                <Label>QR code (optional)</Label>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/30">
                    {paymentAccounts.easypaisa.qrCodeUrl ? (
                      <img src={paymentAccounts.easypaisa.qrCodeUrl} alt="Easypaisa QR" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageOff className="mx-auto h-7 w-7" strokeWidth={1.2} />
                        <span className="mt-2 block text-[10px]">No QR uploaded</span>
                      </div>
                    )}
                  </div>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, "easypaisa")} className="hidden" disabled={uploadingQr === "easypaisa"} />
                    <span className="inline-flex h-10 items-center justify-center gap-2 border border-border px-4 text-xs font-medium transition-colors hover:bg-muted">
                      {uploadingQr === "easypaisa" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingQr === "easypaisa" ? "Uploading..." : paymentAccounts.easypaisa.qrCodeUrl ? "Replace QR code" : "Upload QR code"}
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-5 border-t border-border/70 pt-7">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-heading text-xl">WhatsApp payment proof</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Where customers send their payment screenshots.</p>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={whatsapp.enabled} onChange={(e) => setWhatsapp({ ...whatsapp, enabled: e.target.checked })} className="h-4 w-4 rounded accent-primary" />
                Accept payment screenshots via WhatsApp
              </label>
              <div className="max-w-md space-y-2">
                <Label>WhatsApp number</Label>
                <Input value={whatsapp.number} onChange={(e) => setWhatsapp({ ...whatsapp, number: e.target.value })} className="h-11" placeholder="+92 300 1234567" />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="social" className="mt-0 space-y-6">
            <section className="border-b border-border/70 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">05 / Community</p>
              <h2 className="mt-2 font-heading text-2xl font-medium">Social links</h2>
              <p className="mt-1 text-sm text-muted-foreground">Connect your restaurant's social profiles.</p>
            </section>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input id="instagram" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} className="h-11" placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input id="facebook" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} className="h-11" placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok URL</Label>
                <Input id="tiktok" value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} className="h-11" placeholder="https://tiktok.com/@..." />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-0 space-y-6">
            <section className="border-b border-border/70 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">06 / Discovery</p>
              <h2 className="mt-2 font-heading text-2xl font-medium">Search appearance</h2>
              <p className="mt-1 text-sm text-muted-foreground">Control how your restaurant appears in search results.</p>
            </section>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Page title</Label>
                <Input id="seoTitle" value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta description</Label>
                <Textarea id="seoDescription" rows={4} value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} className="resize-y" />
                <p className="text-xs text-muted-foreground">A concise description that helps guests understand what your restaurant offers.</p>
              </div>
              <div className="border border-border/70 bg-muted/20 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Search preview</p>
                <p className="mt-3 truncate text-base font-medium text-[#1a0dab]">{seo.title || "Your page title"}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{seo.description || "Your meta description will appear here."}</p>
              </div>
            </div>
          </TabsContent>

          <div className="flex justify-end border-t border-border/70 pt-5">
            <Button onClick={handleSave} disabled={saving} className="h-11 gap-2 px-5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
