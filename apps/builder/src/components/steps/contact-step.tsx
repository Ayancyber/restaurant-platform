"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/schemas/contact";
import { useWizardStore } from "@/lib/store/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export function ContactStep() {
  const { data, updateData, _hasHydrated } = useWizardStore();
  const [mounted, setMounted] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: "",
      email: "",
      address: "",
      instagram: "",
      facebook: "",
      hours: data.hours,
    },
    mode: "onChange",
  });

  const { fields } = useFieldArray({ control, name: "hours" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    reset({
      phone: data.contact.phone,
      email: data.contact.email,
      address: data.contact.address,
      instagram: data.contact.instagram,
      facebook: data.contact.facebook,
      hours: data.hours,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  const watchedHours = watch("hours");

  useEffect(() => {
    const subscription = watch((values) => {
      updateData("contact", {
        phone: values.phone || "",
        email: values.email || "",
        address: values.address || "",
        instagram: values.instagram || "",
        facebook: values.facebook || "",
      });
      if (values.hours) {
        updateData("hours", values.hours as ContactFormData["hours"]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateData]);

  function copyMondayToAll() {
    const monday = watchedHours[0];
    for (let i = 1; i < 7; i++) {
      setValue(`hours.${i}.open`, monday.open);
      setValue(`hours.${i}.close`, monday.close);
      setValue(`hours.${i}.closed`, monday.closed);
    }
    toast.success("Monday's hours copied to all days");
  }

  if (!mounted || !_hasHydrated) {
    return <div className="h-96 animate-pulse bg-muted rounded-md" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+92 300 1234567"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@yourrestaurant.pk"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              rows={2}
              placeholder="Main Boulevard, Gulberg III, Lahore, Pakistan"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL (Optional)</Label>
              <Input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/yourrestaurant"
                {...register("instagram")}
              />
              {errors.instagram && (
                <p className="text-xs text-destructive">{errors.instagram.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL (Optional)</Label>
              <Input
                id="facebook"
                type="url"
                placeholder="https://facebook.com/yourrestaurant"
                {...register("facebook")}
              />
              {errors.facebook && (
                <p className="text-xs text-destructive">{errors.facebook.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Opening Hours
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyMondayToAll}
            className="gap-2"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Monday to All
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, i) => {
            const day = watchedHours[i];
            return (
              <div
                key={field.id}
                className="grid grid-cols-[80px_1fr_1fr_auto] gap-3 items-center"
              >
                <span className="text-sm font-medium truncate">
                  {day.day.slice(0, 3)}
                </span>
                <Input
                  type="time"
                  {...register(`hours.${i}.open`)}
                  disabled={day.closed}
                />
                <Input
                  type="time"
                  {...register(`hours.${i}.close`)}
                  disabled={day.closed}
                />
                <label className="flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    {...register(`hours.${i}.closed`)}
                    className="rounded"
                  />
                  Closed
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
