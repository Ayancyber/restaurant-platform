"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Store, Phone, Clock, Share2, Search } from "lucide-react";
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

  // Form state
  const [brand, setBrand] = useState(initial.brand);
  const [contact, setContact] = useState(initial.contact);
  const [hours, setHours] = useState(initial.hours);
  const [social, setSocial] = useState(initial.social);
  const [seo, setSeo] = useState(initial.seo);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, contact, hours, social, seo }),
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
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" /> Social
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
        </TabsList>

        {/* BRAND */}
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
                  placeholder="Authentic Italian Since 1987"
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
                  placeholder="Where every meal feels like home."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT */}
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

        {/* HOURS */}
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

        {/* SOCIAL */}
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
                  placeholder="https://instagram.com/yourhandle"
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
                  placeholder="https://facebook.com/yourpage"
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
                  placeholder="https://tiktok.com/@yourhandle"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
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
