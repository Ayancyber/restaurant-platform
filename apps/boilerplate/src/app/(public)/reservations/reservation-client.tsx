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
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <main className="min-h-screen bg-[#f7f4ed] px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal variant="fade-up">
            <div className="border-y border-[#ded6ca] py-16 text-center sm:py-24">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-primary/30 text-primary">
                <CheckCircle2 className="h-8 w-8" strokeWidth={1.3} />
              </div>

              <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Request received
              </p>

              <h1 className="mt-5 font-heading text-5xl font-medium leading-[0.95] tracking-[-0.05em] text-[#29251f] sm:text-7xl">
                Your table
                <br />
                <span className="italic text-primary">awaits.</span>
              </h1>

              <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-[#776e62] sm:text-base">
                Thank you for choosing {brand.name}. Your reservation request
                has been received. We&apos;ll confirm your booking shortly via
                phone or email.
              </p>

              <div className="mx-auto mt-10 max-w-md border-y border-[#ded6ca] py-5">
                <p className="text-xs text-[#82786c]">
                  Need assistance with your booking?
                </p>
                <a
                  href={`tel:${contact.phone}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#29251f] transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {contact.phone}
                </a>
              </div>

              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-none px-7">
                  <Link href="/menu">
                    Explore Menu
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-none border-[#cfc5b7] bg-transparent px-7 text-[#29251f] hover:bg-[#eee8dd]"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed]">
      <header className="border-b border-[#ded6ca]">
        <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-16 sm:px-10 sm:pb-16 sm:pt-24 lg:px-16 xl:px-24">
          <Reveal variant="fade-up">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary sm:text-xs">
              <span className="h-px w-10 bg-primary" />
              An invitation to dine
            </p>

            <div className="grid gap-8 md:grid-cols-[1fr_0.5fr] md:items-end">
              <h1 className="max-w-[1000px] font-heading text-[clamp(3.7rem,9vw,8rem)] font-medium leading-[0.86] tracking-[-0.065em] text-[#29251f]">
                A seat at
                <br />
                the <span className="italic text-primary">table.</span>
              </h1>

              <p className="max-w-[390px] text-sm leading-7 text-[#776e62] md:ml-auto md:pb-2 sm:text-base">
                Make time for good food and good company. Request your table at{" "}
                {brand.name}, and let us take care of the rest.
              </p>
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-[#ded6ca] pt-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8b8175]">
                Your next dining experience
              </span>
              <span className="font-heading text-2xl italic text-primary">
                03
              </span>
            </div>
          </Reveal>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-14 px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20 lg:px-16 xl:px-24">
        <Reveal variant="fade-right">
          <div>
            <div className="mb-9 flex items-end justify-between border-b border-[#ded6ca] pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  01 / The details
                </p>
                <h2 className="mt-3 font-heading text-3xl font-medium tracking-[-0.04em] text-[#29251f] sm:text-4xl">
                  Plan your visit
                </h2>
              </div>
              <CalendarDays className="mb-1 h-6 w-6 text-primary" strokeWidth={1.3} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8175]">
                  Your contact information
                </p>

                <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customer_name"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Full name *
                    </Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      required
                      placeholder="Your name"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customer_phone"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Phone number *
                    </Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      required
                      placeholder="+92 300 1234567"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label
                      htmlFor="customer_email"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Email address <span className="text-[#a49a8d]">(optional)</span>
                    </Label>
                    <Input
                      id="customer_email"
                      name="customer_email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8175]">
                  Your reservation
                </p>

                <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="party_size"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Number of guests *
                    </Label>
                    <Select value={partySize} onValueChange={setPartySize}>
                      <SelectTrigger
                        id="party_size"
                        className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none focus:ring-0"
                      >
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
                    <Label
                      htmlFor="reservation_date"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Date *
                    </Label>
                    <Input
                      id="reservation_date"
                      name="reservation_date"
                      type="date"
                      required
                      min={today}
                      max={maxDate}
                      defaultValue={today}
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label
                      htmlFor="reservation_time"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Preferred time *
                    </Label>
                    <Input
                      id="reservation_time"
                      name="reservation_time"
                      type="time"
                      required
                      defaultValue="19:00"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0 sm:max-w-[calc(50%-12px)]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8175]">
                  A little extra
                </p>

                <div className="space-y-2">
                  <Label
                    htmlFor="special_requests"
                    className="text-xs font-medium text-[#51483e]"
                  >
                    Special requests{" "}
                    <span className="text-[#a49a8d]">(optional)</span>
                  </Label>
                  <Textarea
                    id="special_requests"
                    name="special_requests"
                    rows={3}
                    placeholder="Celebrations, seating preferences, dietary notes..."
                    className="min-h-[110px] resize-y rounded-none border border-[#cfc5b7] bg-transparent px-4 py-3 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="border-t border-[#ded6ca] pt-7">
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full justify-between rounded-none bg-primary px-6 text-sm font-medium tracking-wide text-white transition-all hover:bg-primary/90 active:scale-[0.99]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Requesting...
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4" />
                        Request reservation
                      </span>
                      <ArrowUpRight className="h-5 w-5" />
                    </>
                  )}
                </Button>

                <p className="mt-4 text-center text-xs leading-6 text-[#8b8175]">
                  We&apos;ll confirm your booking within a few hours. For
                  parties over 12, please call us directly.
                </p>
              </div>
            </form>
          </div>
        </Reveal>

        <aside className="space-y-10 lg:pt-1">
          <Reveal variant="fade-left">
            <div className="border-t border-[#29251f] pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  02 / When to visit
                </p>
                <Clock className="h-5 w-5 text-primary" strokeWidth={1.3} />
              </div>

              <h2 className="mt-5 font-heading text-2xl font-medium tracking-[-0.03em] text-[#29251f]">
                Opening hours
              </h2>

              <ul className="mt-6 divide-y divide-[#ded6ca]">
                {hours.map((h) => (
                  <li
                    key={h.day}
                    className="flex items-center justify-between gap-3 py-3 text-xs"
                  >
                    <span className="text-[#82786c]">{h.day}</span>
                    <span className="font-medium text-[#39332c]">
                      {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal variant="fade-left" delay={120}>
            <div className="border-t border-[#29251f] pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  03 / Find us
                </p>
                <MapPin className="h-5 w-5 text-primary" strokeWidth={1.3} />
              </div>

              <h2 className="mt-5 font-heading text-2xl font-medium tracking-[-0.03em] text-[#29251f]">
                Come on in
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#82786c]">
                {contact.address}
              </p>

              <a
                href={`tel:${contact.phone}`}
                className="mt-5 inline-flex items-center gap-3 border-b border-[#cfc5b7] pb-3 text-sm font-medium text-[#39332c] transition-colors hover:border-primary hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" />
                {contact.phone}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </Reveal>

          <Reveal variant="fade-left" delay={240}>
            <div className="bg-[#302a24] p-6 text-[#f7f4ed] sm:p-7">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#d59b73]" strokeWidth={1.4} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d59b73]">
                  Gathering together
                </p>
              </div>

              <h2 className="mt-5 font-heading text-2xl font-medium leading-tight">
                Bringing a bigger group?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/65">
                For bookings of 12+ guests, please call us directly so we can
                help arrange your visit.
              </p>

              <a
                href={`tel:${contact.phone}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#d59b73]"
              >
                Call {contact.phone}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </aside>
      </section>
    </main>
  );
}