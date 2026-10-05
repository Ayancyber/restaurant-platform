import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Palette,
  Database,
  Download,
  Zap,
  Shield,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Restaurant Builder</span>
          </div>
          <Button asChild size="sm">
            <Link href="/build">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          <Zap className="h-3 w-3 mr-1" />
          Launch in 10 minutes
        </Badge>

        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
          Your restaurant website, ready in minutes
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Answer a few questions, connect your own Supabase database, and
          download a fully working restaurant website. Menu, orders,
          reservations, gallery, payments — everything you need.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/build">
              Start Building — Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No coding required. Own your code. Own your data.
        </p>
      </section>

      {/* Features grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <Feature
            icon={<Palette className="h-5 w-5" />}
            title="Customize everything"
            body="Brand name, colors, fonts, logo, hero punchlines — all yours."
          />
          <Feature
            icon={<Database className="h-5 w-5" />}
            title="Your own database"
            body="We guide you through Supabase setup. You own the backend and the data."
          />
          <Feature
            icon={<Download className="h-5 w-5" />}
            title="Download your code"
            body="Get a ZIP of the full Next.js source. Deploy anywhere, any time."
          />
          <Feature
            icon={<Shield className="h-5 w-5" />}
            title="No lock-in"
            body="Export your site and host it yourself. Cancel anytime."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="10-minute setup"
            body="No coding. Answer questions, paste SQL, download. Done."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="Modern stack"
            body="Next.js 16, TypeScript, Tailwind, Supabase — production grade."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 text-center border-t">
        <h2 className="font-heading text-3xl font-bold">
          Ready to launch your restaurant online?
        </h2>
        <p className="mt-4 text-muted-foreground">
          It takes less time than reading this page.
        </p>
        <Button asChild size="lg" className="mt-8 gap-2">
          <Link href="/build">
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Restaurant Builder. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
