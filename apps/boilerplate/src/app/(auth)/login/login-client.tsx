"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function LoginClient({
  brandName,
  brandLogoUrl,
}: {
  brandName: string;
  brandLogoUrl: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative min-h-[280px] overflow-hidden bg-[#29221d] sm:min-h-[360px] lg:min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/demo/restaurant-interior.webp')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />

        <div className="relative flex min-h-[280px] flex-col justify-between p-7 text-white sm:min-h-[360px] sm:p-10 lg:min-h-screen lg:p-14">
          <Link href="/" className="w-fit text-xs font-medium uppercase tracking-[0.24em] text-white/80 transition-colors hover:text-white">
            <span aria-hidden="true">←</span> Back to website
          </Link>

          <div className="max-w-xl pb-3 lg:pb-8">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
              Restaurant management
            </p>
            <h1 className="font-heading text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Every detail, <span className="text-white/65">beautifully</span> in place.
            </h1>
            <div className="mt-7 flex items-center gap-4">
              <span className="h-px w-12 bg-white/60" />
              <p className="text-sm tracking-wide text-white/75">{brandName}</p>
            </div>
          </div>

          <p className="hidden text-[10px] uppercase tracking-[0.2em] text-white/50 lg:block">
            Private workspace · Authorized access only
          </p>
        </div>
      </section>

      <section className="flex min-h-[560px] items-center justify-center px-6 py-14 sm:px-10 lg:min-h-screen lg:px-14">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            {brandLogoUrl && brandLogoUrl !== "/logo.svg" ? (
              <div className="mb-8 flex h-16 w-40 items-center">
                <img
                  src={brandLogoUrl}
                  alt={`${brandName} logo`}
                  className="max-h-16 max-w-full object-contain object-left"
                />
              </div>
            ) : (
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-[#c2410c]/20 bg-[#c2410c]/[0.07] font-heading text-xl text-[#c2410c]">
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c2410c]">
              Welcome back
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-[#29221d] sm:text-4xl">
              Sign in to your workspace.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#77716b]">
              Manage your restaurant, orders and daily operations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-[#514a44]">
                Email address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9289]" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-12 rounded-none border-0 border-b border-[#d9d2c9] bg-transparent pl-7 text-sm shadow-none transition-colors placeholder:text-[#aaa198] focus-visible:border-[#c2410c] focus-visible:ring-0"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-[#514a44]">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9289]" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 rounded-none border-0 border-b border-[#d9d2c9] bg-transparent pl-7 text-sm shadow-none transition-colors placeholder:text-[#aaa198] focus-visible:border-[#c2410c] focus-visible:ring-0"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-3 h-12 w-full gap-2 rounded-sm bg-[#c2410c] text-sm font-medium tracking-wide text-white shadow-none transition-colors hover:bg-[#9f350b]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 border-t border-[#e5dfd7] pt-5">
            <p className="text-[11px] leading-5 text-[#928980]">
              This area is reserved for authorized restaurant staff.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
