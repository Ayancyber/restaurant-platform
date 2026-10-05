import type { WizardData } from "@/lib/store/wizard-store";

/**
 * Converts wizard state into the exact restaurant.config.json shape
 * that the boilerplate expects.
 */
export function buildRestaurantConfig(data: WizardData) {
  return {
    brand: {
      name: data.brand.name || "My Restaurant",
      tagline: data.brand.tagline || "",
      heroPunchline: data.brand.heroPunchline || "",
      logoUrl: data.brand.logoDataUrl || "/logo.svg",
      faviconUrl: "/favicon.ico",
    },
    theme: {
      primaryColor: data.theme.primaryColor,
      accentColor: data.theme.accentColor,
      fontHeading: data.theme.fontHeading,
      fontBody: data.theme.fontBody,
      radius: "0.5rem",
    },
    nav: {
      links: [
        { href: "/", label: "Home" },
        { href: "/menu", label: "Menu" },
        ...(data.features.reservations
          ? [{ href: "/reservations", label: "Reservations" }]
          : []),
        ...(data.features.gallery
          ? [{ href: "/gallery", label: "Gallery" }]
          : []),
        { href: "/contact", label: "Contact" },
      ],
      ctaLabel: "Cart",
      ctaHref: "/cart",
      showPhone: true,
    },
    home: {
      sections: {
        hero: true,
        quickInfo: true,
        featured: true,
      },
      hero: {
        badge: data.brand.tagline || "",
        primaryCta: { label: "View Menu", href: "/menu" },
        secondaryCta: {
          label: data.features.reservations ? "Book a Table" : "Contact Us",
          href: data.features.reservations ? "/reservations" : "/contact",
        },
      },
      featured: {
        heading: "Featured Dishes",
        subheading: "Handpicked favorites from our kitchen",
        limit: 6,
        ctaLabel: "See Full Menu",
      },
    },
    footer: {
      contactHeading: "Contact",
      hoursHeading: "Hours",
      exploreHeading: "Explore",
      hoursToShow: 4,
      copyright: "All rights reserved.",
      madeIn: "Made with ❤️",
      showSocial: true,
    },
    contact: {
      phone: data.contact.phone,
      email: data.contact.email,
      address: data.contact.address,
      mapEmbedUrl: "",
    },
    hours: data.hours,
    features: data.features,
    currency: data.currency,
    payment: {
      provider: "pk-local",
      methods: [
        ...(data.paymentAccounts.jazzcash.enabled ? ["jazzcash"] : []),
        ...(data.paymentAccounts.easypaisa.enabled ? ["easypaisa"] : []),
        ...(data.paymentAccounts.cod.enabled ? ["cod"] : []),
      ],
      codEnabled: data.paymentAccounts.cod.enabled,
      deliveryFee: 150,
    },
    paymentAccounts: {
      jazzcash: {
        enabled: data.paymentAccounts.jazzcash.enabled,
        accountName: data.paymentAccounts.jazzcash.accountName,
        accountNumber: data.paymentAccounts.jazzcash.accountNumber,
        qrCodeUrl: data.paymentAccounts.jazzcash.qrCodeDataUrl,
      },
      easypaisa: {
        enabled: data.paymentAccounts.easypaisa.enabled,
        accountName: data.paymentAccounts.easypaisa.accountName,
        accountNumber: data.paymentAccounts.easypaisa.accountNumber,
        qrCodeUrl: data.paymentAccounts.easypaisa.qrCodeDataUrl,
      },
      bank: {
        enabled: false,
        bankName: "",
        accountTitle: "",
        accountNumber: "",
        iban: "",
      },
    },
    whatsapp: {
      enabled: data.whatsapp.enabled,
      number: data.whatsapp.number,
    },
    social: {
      instagram: "",
      facebook: "",
      tiktok: "",
    },
    seo: {
      title: data.seo.title || data.brand.name || "My Restaurant",
      description: data.seo.description || data.brand.tagline || "",
      keywords: [],
    },
  };
}

/**
 * Returns the config as a pretty-printed JSON string ready to write to a file.
 */
export function serializeRestaurantConfig(data: WizardData): string {
  return JSON.stringify(buildRestaurantConfig(data), null, 2);
}

/**
 * Generates the .env.local file content, pre-filling Supabase URL + anon key.
 * Service role is left blank for the user to fill in themselves.
 */
export function generateEnvFile(data: WizardData): string {
  const lines: string[] = [];

  lines.push("# ==============================================");
  lines.push("# Restaurant Website Environment Variables");
  lines.push("# ==============================================");
  lines.push("");
  lines.push("# Supabase - These are pre-filled for you");
  lines.push(`NEXT_PUBLIC_SUPABASE_URL=${data.supabase.url}`);
  lines.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${data.supabase.anonKey}`);
  lines.push("");
  lines.push("# Service Role Key - paste this yourself from Supabase Settings → API");
  lines.push("# (NEVER commit this to a public repo)");
  lines.push(
    `SUPABASE_SERVICE_ROLE_KEY=${data.supabase.serviceRoleKey || "paste_your_service_role_key_here"}`
  );
  lines.push("");
  lines.push("# Optional - Email notifications (get a key at resend.com)");
  lines.push("RESEND_API_KEY=");
  lines.push("");
  lines.push("# Optional - Payments (leave blank if using our QR flow)");
  lines.push("STRIPE_SECRET_KEY=");
  lines.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=");

  if (data.supabase.adminEmail && data.supabase.adminPassword) {
    lines.push("");
    lines.push("# ==============================================");
    lines.push("# ADMIN LOGIN (created automatically in your Supabase)");
    lines.push("# ==============================================");
    lines.push(`# Email:    ${data.supabase.adminEmail}`);
    lines.push(`# Password: ${data.supabase.adminPassword}`);
    lines.push("# Log in at /login on your deployed site.");
  }

  return lines.join("\n");
}

/**
 * Generates a customized README.md for the user's restaurant website.
 */
export function generateReadme(data: WizardData): string {
  const name = data.brand.name || "Your Restaurant";
  const url = data.supabase.url;

  return `# ${name} — Restaurant Website

Welcome! You just generated a fully functional restaurant website.

## 🚀 Quick Start (5 minutes)

### 1. Install dependencies

\`\`\`bash
pnpm install
# or: npm install
\`\`\`

### 2. Set up your environment

Copy \`.env.example\` to \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Open \`.env.local\` and paste your **service_role key** (from Supabase → Settings → API).

**Your Supabase URL and anon key are already filled in.**

### 3. Run the dev server

\`\`\`bash
pnpm dev
\`\`\`

Open http://localhost:3000 → your restaurant website is live!

## 🔐 Admin Access

Your admin panel is at http://localhost:3000/admin

**Login credentials were set during the wizard** and are stored in your
Supabase project (auto-created when you ran the SQL). Check \`.env.local\`
for the email and password you chose.

To log in:
1. Go to http://localhost:3000/login
2. Enter your admin email and password
3. You'll be redirected to the admin dashboard

**Forgot your password?** Reset it in Supabase →
Authentication → Users → find your user → Reset password.

## 📦 What's Included

- ✅ Menu management (categories + items with photos)
- ✅ Online ordering with QR-code payment flow
- ✅ Table reservations
- ✅ Photo gallery
- ✅ Contact form
- ✅ Admin dashboard with live stats
- ✅ Order tracking for customers

## 🌐 Deploy to Production

### Option 1: Vercel (recommended, free tier works)

1. Push this code to GitHub
2. Go to https://vercel.com/new → import your repo
3. Add environment variables:
   - \`NEXT_PUBLIC_SUPABASE_URL\` (from .env.local)
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` (from .env.local)
   - \`SUPABASE_SERVICE_ROLE_KEY\` (from .env.local)
4. Deploy → get your live URL

### Option 2: Any Node.js host

This is a standard Next.js 16 app. It runs anywhere:
- Railway, Render, Fly.io
- Your own VPS
- Docker

Just run \`pnpm build && pnpm start\`.

## 🗄️ Your Database

Your Supabase project: ${url}

All data (menu, orders, reservations) lives there. You own it.

## ❓ Need Help?

- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs

Enjoy your new website! 🍽️
`;
}
