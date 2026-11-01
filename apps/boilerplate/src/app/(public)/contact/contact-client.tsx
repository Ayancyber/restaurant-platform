"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Share2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Reveal } from "@/components/site/reveal";
import type { RestaurantConfig } from "@/config";

export function ContactClient({ settings }: { settings: RestaurantConfig }) {
  const { brand, contact, hours, social } = settings;
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to send message");
        setSubmitting(false);
        return;
      }

      toast.success("Message sent!");
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
                Successfully delivered
              </p>

              <h1 className="mt-5 font-heading text-5xl font-medium leading-[0.95] tracking-[-0.05em] text-[#29251f] sm:text-7xl">
                The conversation
                <br />
                <span className="italic text-primary">begins here.</span>
              </h1>

              <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-[#776e62] sm:text-base">
                Thank you for reaching out to {brand.name}. Your message has
                been received. We&apos;ll get back to you soon.
              </p>

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
              We&apos;re listening
            </p>

            <div className="grid gap-8 md:grid-cols-[1fr_0.5fr] md:items-end">
              <h1 className="max-w-[1000px] font-heading text-[clamp(3.4rem,8.5vw,7.5rem)] font-medium leading-[0.86] tracking-[-0.065em] text-[#29251f]">
                Let&apos;s start
                <br />
                a <span className="italic text-primary">conversation.</span>
              </h1>

              <p className="max-w-[390px] text-sm leading-7 text-[#776e62] md:ml-auto md:pb-2 sm:text-base">
                Questions, feedback or enquiries — we&apos;d love to hear what&apos;s
                on your mind. Send us a note and we&apos;ll be in touch.
              </p>
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-[#ded6ca] pt-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8b8175]">
                A direct line to {brand.name}
              </span>
              <span className="font-heading text-2xl italic text-primary">
                04
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
                  01 / Write to us
                </p>
                <h2 className="mt-3 font-heading text-3xl font-medium tracking-[-0.04em] text-[#29251f] sm:text-4xl">
                  Send a message
                </h2>
              </div>
              <Send className="mb-1 h-6 w-6 text-primary" strokeWidth={1.3} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8175]">
                  First, a little introduction
                </p>

                <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Your name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Your name"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Email address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Phone number{" "}
                      <span className="text-[#a49a8d]">(optional)</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+92 300 1234567"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className="text-xs font-medium text-[#51483e]"
                    >
                      Subject{" "}
                      <span className="text-[#a49a8d]">(optional)</span>
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      className="h-12 rounded-none border-0 border-b border-[#cfc5b7] bg-transparent px-0 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8175]">
                  Tell us what&apos;s on your mind
                </p>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-xs font-medium text-[#51483e]"
                  >
                    Your message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="We&apos;re listening..."
                    className="min-h-[170px] resize-y rounded-none border border-[#cfc5b7] bg-transparent px-4 py-3 text-sm shadow-none placeholder:text-[#a49a8d] focus-visible:border-primary focus-visible:ring-0"
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
                      Sending...
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-3">
                        <Send className="h-4 w-4" />
                        Send your message
                      </span>
                      <ArrowUpRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="mt-4 text-center text-xs leading-6 text-[#8b8175]">
                  Your message will be sent directly to {brand.name}.
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
                  02 / Find us
                </p>
                <MapPin className="h-5 w-5 text-primary" strokeWidth={1.3} />
              </div>

              <h2 className="mt-5 font-heading text-2xl font-medium tracking-[-0.03em] text-[#29251f]">
                Come on in
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#82786c]">
                {contact.address}
              </p>

              <div className="mt-5 space-y-4">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 text-sm text-[#39332c] transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {contact.phone}
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 border-t border-[#ded6ca] pt-4 text-sm text-[#39332c] transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="break-all">{contact.email}</span>
                  <ArrowUpRight className="ml-auto h-4 w-4 shrink-0" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal variant="fade-left" delay={120}>
            <div className="border-t border-[#29251f] pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  03 / When to visit
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

          {(social.instagram || social.facebook) && (
            <Reveal variant="fade-left" delay={240}>
              <div className="bg-[#302a24] p-6 text-[#f7f4ed] sm:p-7">
                <div className="flex items-center gap-3">
                  <Share2
                    className="h-5 w-5 text-[#d59b73]"
                    strokeWidth={1.4}
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d59b73]">
                    04 / Stay connected
                  </p>
                </div>

                <h2 className="mt-5 font-heading text-2xl font-medium">
                  Follow along.
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  Find us on social media and stay connected.
                </p>

                <div className="mt-6 space-y-3">
                  {social.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between border-t border-white/15 pt-3 text-sm text-white transition-colors hover:text-[#d59b73]"
                    >
                      Instagram
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}

                  {social.facebook && (
                    <a
                      href={social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between border-t border-white/15 pt-3 text-sm text-white transition-colors hover:text-[#d59b73]"
                    >
                      Facebook
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </aside>
      </section>
    </main>
  );
}