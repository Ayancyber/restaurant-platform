"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  themeSchema,
  type ThemeFormData,
  FONT_OPTIONS,
  COLOR_PRESETS,
} from "@/lib/schemas/theme";
import { useWizardStore } from "@/lib/store/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles } from "lucide-react";

export function ThemeStep() {
  const { data, updateData, _hasHydrated } = useWizardStore();
  const [mounted, setMounted] = useState(false);

  const { register, watch, setValue, reset } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      primaryColor: "#c2410c",
      accentColor: "#facc15",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    reset({
      primaryColor: data.theme.primaryColor,
      accentColor: data.theme.accentColor,
      fontHeading: data.theme.fontHeading,
      fontBody: data.theme.fontBody,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  const watchedPrimary = watch("primaryColor");
  const watchedAccent = watch("accentColor");
  const watchedHeading = watch("fontHeading");
  const watchedBody = watch("fontBody");

  useEffect(() => {
    const subscription = watch((values) => {
      updateData("theme", {
        primaryColor: values.primaryColor || "#c2410c",
        accentColor: values.accentColor || "#facc15",
        fontHeading: values.fontHeading || "Playfair Display",
        fontBody: values.fontBody || "Inter",
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateData]);

  function applyPreset(primary: string, accent: string) {
    setValue("primaryColor", primary, { shouldValidate: true });
    setValue("accentColor", accent, { shouldValidate: true });
  }

  if (!mounted || !_hasHydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="h-96 animate-pulse bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left: Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Color Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset.primary, preset.accent)}
                  className="rounded-lg border p-3 hover:border-primary transition-colors text-left"
                >
                  <div className="flex gap-2 mb-2">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <p className="text-xs font-medium">{preset.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={watchedPrimary}
                    onChange={(e) =>
                      setValue("primaryColor", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    id="primaryColor"
                    {...register("primaryColor")}
                    placeholder="#c2410c"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={watchedAccent}
                    onChange={(e) =>
                      setValue("accentColor", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    id="accentColor"
                    {...register("accentColor")}
                    placeholder="#facc15"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select
                value={watchedHeading}
                onValueChange={(v) =>
                  setValue("fontHeading", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select
                value={watchedBody}
                onValueChange={(v) =>
                  setValue("fontBody", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview */}
      <div className="lg:sticky lg:top-28 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg border p-6"
              style={{
                background: `linear-gradient(135deg, ${watchedPrimary}10, transparent, ${watchedAccent}10)`,
                fontFamily: watchedBody,
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: watchedPrimary }}
                >
                  B
                </div>
                <span className="font-semibold text-sm">Your Restaurant</span>
              </div>

              <div className="text-center py-4">
                <h3
                  className="text-xl font-bold leading-tight"
                  style={{ fontFamily: watchedHeading, color: watchedPrimary }}
                >
                  Where every meal feels like home
                </h3>
                <p className="text-sm mt-4 text-muted-foreground">
                  A glimpse of how your brand colors and fonts look together.
                </p>
                <button
                  type="button"
                  className="mt-6 px-4 py-2 rounded-md text-white text-sm font-medium"
                  style={{ backgroundColor: watchedPrimary }}
                >
                  View Menu
                </button>
                <button
                  type="button"
                  className="mt-2 ml-2 px-4 py-2 rounded-md text-sm font-medium text-gray-900"
                  style={{ backgroundColor: watchedAccent }}
                >
                  Book Table
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
