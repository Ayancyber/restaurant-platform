"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Reveal } from "@/components/site/reveal";
import type { RestaurantConfig } from "@/config";

export function ReservationClient({ settings }: { settings: RestaurantConfig }) {
  const { brand, contact, hours } = settings;
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [partySize, setPartySize] = useState("2");

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      customer_name: formData.get("customer_name") as string,
      customer_phone: formData.get("customer_phone") as string,
      customer_email: formData.get("customer_email") as string,
      party_size: Number(partySize),
      reservation_date: formData.get("reservation_date") as string,
      reservation_time: formData.get("reservation_time") as string,
      special_requests: formData.get("special_requests") as string,
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to book reservation");
        setSubmitting(false);
        return;
      }

      toast.success("Reservation request received!");
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20">
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-fit rounded-full bg-green-500/10 p-4 animate-zoom-in-soft">
              <CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce-soft" />
            </div>
            <h1 className="font-heading text-3xl font-bold mt-6 animate-fade-in-up delay-150">
              Reservation Requested!
            </h1>
            <p className="mt-3 text-muted-foreground">
              Thank you for choosing {brand.name}. We'll confirm your booking
              shortly via phone or email.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Questions? Call us at{" "}
              <a
                href={`tel:${contact.phone}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {contact.phone}
              </a>
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/menu">Explore Menu</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <Reveal as="header" className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          Reserve a Table
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Book your spot at {brand.name} — we'll save you the best seat in the
          house.
        </p>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <Reveal variant="fade-right">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    required
                    placeholder="Ahmed Khan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Phone *</Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    required
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">Email (optional)</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="party_size">Guests *</Label>
                  <Select value={partySize} onValueChange={setPartySize}>
                    <SelectTrigger id="party_size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservation_date">Date *</Label>
                  <Input
                    id="reservation_date"
                    name="reservation_date"
                    type="date"
                    required
                    min={today}
                    max={maxDate}
                    defaultValue={today}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservation_time">Time *</Label>
                  <Input
                    id="reservation_time"
                    name="reservation_time"
                    type="time"
                    required
                    defaultValue="19:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requests">
                  Special Requests (optional)
                </Label>
                <Textarea
                  id="special_requests"
                  name="special_requests"
                  rows={3}
                  placeholder="Birthday celebration, window seat, allergies..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 transition-transform active:scale-[0.98]"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4" />
                    Request Reservation
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We'll confirm your booking within a few hours. For parties over
                12, please call us.
              </p>
            </form>
          </CardContent>
        </Card>
        </Reveal>

        <div className="space-y-6">
          <Reveal variant="fade-left">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium">
                      {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          </Reveal>

          <Reveal variant="fade-left" delay={120}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Find Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{contact.address}</p>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </a>
            </CardContent>
          </Card>
          </Reveal>

          <Reveal variant="fade-left" delay={240}>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 text-sm">
              <p className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Large Groups
              </p>
              <p className="text-muted-foreground mt-2">
                For bookings of 12+ guests, please call us directly at{" "}
                <a
                  href={`tel:${contact.phone}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {contact.phone}
                </a>
              </p>
            </CardContent>
          </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
