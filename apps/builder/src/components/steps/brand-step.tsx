"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, type BrandFormData } from "@/lib/schemas/brand";
import { useWizardStore } from "@/lib/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function BrandStep() {
  const { data, updateData, _hasHydrated } = useWizardStore();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      tagline: "",
      heroPunchline: "",
      logoDataUrl: "",
      faviconDataUrl: "",
    },
    mode: "onChange",
  });

  // Wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved data into form once hydrated
  useEffect(() => {
    if (!_hasHydrated) return;

    reset({
      name: data.brand.name,
      tagline: data.brand.tagline,
      heroPunchline: data.brand.heroPunchline,
      logoDataUrl: data.brand.logoDataUrl,
      faviconDataUrl: data.brand.faviconDataUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  // Live values for preview
  const watchedName = watch("name");
  const watchedTagline = watch("tagline");
  const watchedPunchline = watch("heroPunchline");
  const watchedLogo = watch("logoDataUrl");
  const watchedFavicon = watch("faviconDataUrl");

  // Sync to store whenever form values change (reads everything from form)
  useEffect(() => {
    const subscription = watch((values) => {
      updateData("brand", {
        name: values.name || "",
        tagline: values.tagline || "",
        heroPunchline: values.heroPunchline || "",
        logoDataUrl: values.logoDataUrl || "",
        faviconDataUrl: values.faviconDataUrl || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateData]);

  // Handle logo file upload → base64
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setValue("logoDataUrl", dataUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setValue("logoDataUrl", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Avoid SSR mismatch
  if (!mounted || !_hasHydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 animate-pulse bg-muted rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left: Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Restaurant Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Bella Cucina"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This appears in your navbar, footer, and page titles.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="e.g. Authentic Italian Since 1987"
                {...register("tagline")}
              />
              {errors.tagline && (
                <p className="text-xs text-destructive">
                  {errors.tagline.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                A short phrase shown under your name. Optional but
                recommended.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroPunchline">Hero Punchline</Label>
              <Input
                id="heroPunchline"
                placeholder="e.g. Where every meal feels like home."
                {...register("heroPunchline")}
              />
              {errors.heroPunchline && (
                <p className="text-xs text-destructive">
                  {errors.heroPunchline.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The bold line on your homepage hero section.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedLogo ? (
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={watchedLogo}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Logo uploaded</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Square images work best
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">No logo yet</p>
                  <p className="text-xs mt-1">
                    If skipped, we'll use your restaurant's initial.
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {watchedLogo ? "Replace Logo" : "Upload Logo"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Max 2MB • PNG, JPG, or SVG recommended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Favicon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedFavicon ? (
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={watchedFavicon}
                    alt="Favicon preview"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Favicon uploaded</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This appears in browser tabs and bookmarks.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setValue("faviconDataUrl", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    if (faviconInputRef.current) faviconInputRef.current.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Using default favicon</p>
                  <p className="text-xs mt-1">
                    Upload a custom browser icon if you have one.
                  </p>
                </div>
              </div>
            )}

            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (file.type !== "image/png") {
                  toast.error("Favicon must be a PNG image");
                  e.target.value = "";
                  return;
                }

                if (file.size > 1024 * 1024) {
                  toast.error("Favicon must be under 1MB");
                  e.target.value = "";
                  return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                  setValue("faviconDataUrl", reader.result as string, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => faviconInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {watchedFavicon ? "Replace Favicon" : "Upload Favicon"}
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG only • Max 1MB • Square image recommended (at least 64 × 64 px)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:sticky lg:top-28 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
              <div className="flex items-center gap-2 mb-8 pb-4 border-b">
                {watchedLogo ? (
                  <img
                    src={watchedLogo}
                    alt="Logo"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {watchedName?.charAt(0)?.toUpperCase() || "R"}
                  </div>
                )}
                <span className="font-semibold text-sm truncate">
                  {watchedName || "Your Restaurant"}
                </span>
              </div>

              <div className="text-center py-4">
                <h3 className="font-heading text-xl font-bold leading-tight">
                  {watchedName || "Your Restaurant Name"}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {watchedTagline || "Your tagline appears here"}
                </p>
                <p className="text-sm mt-4 leading-snug">
                  {watchedPunchline ||
                    "Your hero punchline will show here — a bold, catchy line."}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Preview updates as you type
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
