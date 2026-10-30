# Restaurant Platform

A full-stack restaurant platform built as a PNPM monorepo with two Next.js applications:

- `apps/boilerplate` — a production-ready restaurant website with customer-facing pages, admin dashboard, reservations, orders, payments, and content management.
- `apps/builder` — a wizard-driven app that lets you configure a restaurant brand and generate a ready-to-use restaurant project template.

This repository is designed for rapid restaurant site creation and deployment, with Supabase-powered backend data, modern React UI patterns, and a reusable template workflow.

For project status, live URLs, and implementation milestones, see [PROJECT_STATUS.md](PROJECT_STATUS.md).

---

## Overview

The project combines a polished restaurant storefront with an admin management system and a builder workflow that generates tailored restaurant projects.

### Core product experience

- Public restaurant website with menu, reservations, checkout, order tracking, and contact flows
- Admin panel for managing menu items, categories, orders, reservations, gallery, settings, and messages
- Payment support for local payment flows such as JazzCash, Easypaisa, and COD
- Supabase-powered backend and storage for restaurant data and assets
- Template-export system that generates a pre-configured restaurant app from a guided wizard

### Repository structure

```bash
restaurant-platform/
├─ apps/
│  ├─ boilerplate/            # Restaurant storefront + admin dashboard
│  │  ├─ src/
│  │  ├─ public/
│  │  ├─ package.json
│  │  └─ .env.example
│  └─ builder/               # Restaurant project generator / export wizard
│     ├─ src/
│     ├─ templates/
│     ├─ package.json
│     └─ scripts/
├─ packages/
│  ├─ config-schema/
│  ├─ sql-generator/
│  └─ ui/
├─ scripts/
│  └─ sync-boilerplate.sh
├─ templates/
│  └─ restaurant-base/
├─ package.json
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
├─ PROJECT_STATUS.md
├─ .gitignore
└─ README.md
```

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui component patterns
- Radix UI primitives
- Zustand for app state management
- `react-hook-form` + `zod` for form validation

### Backend & Data

- Supabase
  - Postgres database
  - Authentication
  - Storage
  - Row-level security

### Additional tooling

- `resend` for email integration
- `jszip` for exported project bundles
- `file-saver` for file download flows
- `date-fns` for date utilities
- `sonner` for toast notifications
- `lucide-react` for icons

### Hosting / deployment

- Vercel-ready Next.js apps
- Local first development workflow with PNPM workspaces

---

## Prerequisites

Before you start, make sure you have:

- Node.js 20 or newer
- PNPM 9.x (this project declares `packageManager: pnpm@9.0.0`)
- A Supabase project
- Optional: Vercel account for deployment

### Check your toolchain

```bash
node -v
pnpm -v
```

If `pnpm` is not installed, enable it with:

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

---

## Installation & Setup

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd restaurant-platform
```

### 2) Install dependencies

This monorepo uses PNPM workspaces.

```bash
pnpm install
```

### 3) Configure environment variables

Copy the example app environment file for the restaurant app:

```bash
cp apps/boilerplate/.env.example apps/boilerplate/.env.local
```

Then fill in the required values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Public site URL
NEXT_PUBLIC_SITE_URL=

# Email (Resend)
RESEND_API_KEY=re_xxx

# Pakistan Payments
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=

EASYPAISA_STORE_ID=
EASYPAISA_HASH_KEY=
```

> The `builder` app can generate pre-filled environment files for generated restaurant templates, but the main boilerplate app needs its own local environment values for local development.

---

## Running the Project

The root package defines the app-level development scripts:

```bash
pnpm dev:boilerplate
pnpm dev:builder
```

These map to the package scripts defined in the workspace:

- `boilerplate` runs on the default Next.js port (`3000`)
- `builder` runs on port `3001`

### Direct app commands

#### Boilerplate app

```bash
cd apps/boilerplate
pnpm install
pnpm dev
```

#### Builder app

```bash
cd apps/builder
pnpm install
pnpm dev
```

### Open the apps in the browser

- Boilerplate storefront: http://localhost:3000
- Builder app: http://localhost:3001

---

## Production Builds

From the root:

```bash
pnpm build:boilerplate
pnpm build:builder
```

The app package scripts are:

```bash
cd apps/boilerplate
pnpm build

cd apps/builder
pnpm build
```

---

## Useful Workspace Scripts

### Root scripts

```bash
pnpm dev:boilerplate
pnpm dev:builder
pnpm build:boilerplate
pnpm build:builder
```

### Builder sync workflow

After updating the boilerplate app template, you can sync the generated template files:

```bash
cd apps/builder
pnpm run sync-template
```

This uses the script in [scripts/sync-boilerplate.sh](scripts/sync-boilerplate.sh).

---

## App Responsibilities

### Boilerplate app

The restaurant app is the fully featured customer-facing restaurant experience. It includes:

- menu browsing and ordering
- cart and checkout flows
- order tracking
- reservations and contact forms
- admin dashboard operations
- SEO and metadata configuration
- Supabase-backed CRUD workflows

### Builder app

The builder app is a configuration wizard that helps generate a custom restaurant app. It includes:

- brand and theme configuration
- contact and features setup
- payment configuration
- database setup and SQL generation
- export-ready project generation
- project verification and export workflow

---

## Supabase Setup

This project expects a Supabase project configured for the restaurant app.

Make sure your dashboard has:

- a PostgreSQL database
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- storage/buckets set up for uploaded images and restaurant media

The app architecture and SQL generation tools in the builder are designed to align with the project’s restaurant schema and admin flows.

---

## Deployment

The applications are intended to be deployed to Vercel using their standard Next.js deployment flow.

Typical steps:

1. Connect the project to Vercel
2. Set the required environment variables in the Vercel dashboard
3. Deploy the `boilerplate` app and/or `builder` app separately
4. Use `NEXT_PUBLIC_SITE_URL` for production domain configuration when needed

---

## Notes

- The root monorepo uses PNPM workspaces, so dependency installation should happen from the repository root.
- The project contains a full restaurant site plus a generator tool; both apps can be developed independently while sharing common templates and packages.
- This repository is meant for restaurant business use cases and is designed around a Supabase-first architecture.

---

## License

This project does not currently declare a license file in the repository root. If you plan to distribute or reuse it publicly, confirm the intended licensing before deployment or publishing.

---

## Helpful Resources

- [PROJECT_STATUS.md](PROJECT_STATUS.md)
- [apps/boilerplate/README.md](apps/boilerplate/README.md)
- [apps/builder/README.md](apps/builder/README.md)
- [pnpm-workspace.yaml](pnpm-workspace.yaml)
