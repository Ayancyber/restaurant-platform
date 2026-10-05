"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/lib/store/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  CalendarDays,
  Image as ImageIcon,
  Star,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type FeatureKey = "onlineOrdering" | "reservations" | "gallery" | "reviews" | "newsletter";

const FEATURES: {
  key: FeatureKey;
  title: string;
  description: string;
  icon: typeof ShoppingBag;
}[] = [
  {
    key: "onlineOrdering",
    title: "Online Ordering",
    description:
      "Customers browse the menu, add items to cart, and place orders for pickup or delivery.",
    icon: ShoppingBag,
  },
  {
    key: "reservations",
    title: "Table Reservations",
    description:
      "Customers book tables online with date, time, and party size. You manage from admin.",
    icon: CalendarDays,
  },
  {
    key: "gallery",
    title: "Photo Gallery",
    description:
      "Display restaurant photos, food shots, and interior images with lightbox viewing.",
    icon: ImageIcon,
  },
  {
    key: "reviews",
    title: "Customer Reviews",
    description:
      "Let customers leave reviews and ratings on your site. Moderation via admin.",
    icon: Star,
  },
  {
    key: "newsletter",
    title: "Newsletter Signup",
    description:
      "Collect emails from interested customers. Optional — most restaurants skip this.",
    icon: Mail,
  },
];

export function FeaturesStep() {
  const { data, updateData, _hasHydrated } = useWizardStore();
  const [mounted, setMounted] = useState(false);
  const [features, setFeatures] = useState(data.features);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    setFeatures(data.features);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  function toggle(key: FeatureKey, checked: boolean) {
    const next = { ...features, [key]: checked };
    setFeatures(next);
    updateData("features", next);
  }

  if (!mounted || !_hasHydrated) {
    return <div className="h-96 animate-pulse bg-muted rounded-md" />;
  }

  const enabledCount = Object.values(features).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">
          {enabledCount} of {FEATURES.length} enabled
        </Badge>
        <p className="text-sm text-muted-foreground">
          Only enabled features appear on your public site.
        </p>
      </div>

      <div className="grid gap-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          const isEnabled = features[feature.key];

          return (
            <Card
              key={feature.key}
              className={`transition-colors cursor-pointer ${
                isEnabled ? "border-primary/40 bg-primary/[0.02]" : ""
              }`}
              onClick={() => toggle(feature.key, !isEnabled)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isEnabled
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{feature.title}</p>
                    {isEnabled ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <Checkbox
                  checked={isEnabled}
                  onCheckedChange={(v) => toggle(feature.key, v === true)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 shrink-0"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
