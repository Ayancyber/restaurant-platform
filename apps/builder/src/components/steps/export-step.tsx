"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/lib/store/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  FileCode,
  Database,
  Palette,
  Store,
  CreditCard,
  ListChecks,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

type StepIcon = typeof FileCode;

export function ExportStep() {
  const { data, _hasHydrated } = useWizardStore();
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleDownload() {
    if (!data.supabase.url || !data.supabase.anonKey) {
      toast.error("Please complete Step 6 (Database) first");
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Export failed");
        setDownloading(false);
        return;
      }

      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || "restaurant-website.zip";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Download started!");
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (!mounted || !_hasHydrated) {
    return <div className="h-96 animate-pulse bg-muted rounded-md" />;
  }

  const supaReady = !!(data.supabase.url && data.supabase.anonKey);
  const brandReady = !!data.brand.name;

  const paymentList = [
    data.paymentAccounts.jazzcash.enabled && "JazzCash",
    data.paymentAccounts.easypaisa.enabled && "Easypaisa",
    data.paymentAccounts.cod.enabled && "COD",
  ]
    .filter(Boolean)
    .join(", ");

  const summary = [
    {
      icon: Store,
      label: "Brand",
      value: data.brand.name || "Not set",
      ready: brandReady,
    },
    {
      icon: Palette,
      label: "Theme",
      value: `${data.theme.primaryColor} / ${data.theme.accentColor}`,
      ready: true,
    },
    {
      icon: ListChecks,
      label: "Features",
      value: `${Object.values(data.features).filter(Boolean).length} enabled`,
      ready: true,
    },
    {
      icon: CreditCard,
      label: "Payments",
      value: paymentList || "None",
      ready: true,
    },
    {
      icon: Database,
      label: "Database",
      value: data.supabase.verified ? "Verified" : supaReady ? "Set" : "Missing",
      ready: supaReady,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Your Website Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                >
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.ready
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium truncate">{item.value}</p>
                  </div>
                  {item.ready ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What&apos;s in the ZIP</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <ZipLine icon={FileCode} text="Full Next.js 16 source code" />
            <ZipLine
              icon={Store}
              text="restaurant.config.json — your brand, colors, contacts (all filled in)"
            />
            <ZipLine
              icon={Database}
              text=".env.local with your Supabase URL + anon key pre-filled"
            />
            <ZipLine
              icon={FileCode}
              text="README.md — step-by-step setup + deploy instructions"
            />
            <ZipLine icon={Package} text="SETUP.txt — 3-step quick start" />
            {data.brand.logoDataUrl && (
              <ZipLine icon={Palette} text="Your logo file (public/logo.*)" />
            )}
          </ul>
        </CardContent>
      </Card>

      {!supaReady && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">
                Database not configured
              </p>
              <p className="text-muted-foreground mt-0.5">
                Go back to Step 6 and add your Supabase URL + anon key before
                downloading.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto w-fit rounded-full bg-primary/10 p-4">
            <Download className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-2xl font-bold">
              Ready to download!
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Click below to get your customized restaurant website as a ZIP
              file. Extract it, run{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                pnpm install
              </code>{" "}
              and{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                pnpm dev
              </code>
              .
            </p>
          </div>

          <Button
            onClick={handleDownload}
            disabled={downloading || !supaReady}
            size="lg"
            className="gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Building your ZIP...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Your Website
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Typically 500KB — includes full source code
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            What to do after downloading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <Step n={1}>Extract the ZIP file to a folder on your computer</Step>
            <Step n={2}>
              Open a terminal in that folder and run{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                pnpm install
              </code>
            </Step>
            <Step n={3}>
              Run{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                pnpm dev
              </code>{" "}
              → your site is live at{" "}
              <span className="font-mono text-xs">localhost:3000</span>
            </Step>
            <Step n={4}>
              Log in to your admin panel at{" "}
              <span className="font-mono text-xs">/admin</span> (see README.md
              for admin user setup)
            </Step>
            <Step n={5}>
              When ready to go live, deploy to Vercel (see README.md for
              one-click instructions)
            </Step>
          </ol>

          <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                Deploy on Vercel
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Supabase
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ZipLine({ icon: Icon, text }: { icon: StepIcon; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      <span className="text-muted-foreground pt-0.5">{children}</span>
    </li>
  );
}
