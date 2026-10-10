# Restaurant Platform — Project Status

**Version:** v1.0 + security hardening
**Last updated:** 2026-10-10

---

## Live URLs

- **Builder:** https://restaurant-builder.vercel.app
- **Boilerplate demo:** https://bellacucina-blush.vercel.app

---

## What Works

### Public site (9 pages, dark-mode only)
- Home (hero, featured dishes, quick info, JSON-LD schema)
- Menu (search, categories, images)
- Cart (drawer, persistent)
- Checkout (pickup / delivery / dine-in)
- Payment (JazzCash / Easypaisa QR + COD + "I've Paid")
- Order tracking via **random token** (not order number)
- Reservations
- Gallery (lightbox)
- Contact form
- Track Order (recent orders from this device)
- Sitemap.xml + robots.txt auto-generated
- Per-site SEO (title, description, favicon, OG)

### Admin panel (8 pages)
- Dashboard (today's orders, revenue, reservations)
- Menu CRUD (upload images)
- Categories CRUD
- Orders (status flow, payment verification)
- Reservations (approve / reject / seat)
- Gallery (upload / delete)
- Messages
- Settings (brand, contact, hours, social, SEO, payments)

### Builder (7-step wizard)
- Brand → Theme → Contact → Features → Payments → Database → Export
- SQL generator (matches proven Supabase schema, feature-conditional)
- ZIP export (pre-filled .env.local + restaurant.config.json)
- Live preview of SQL before export
- Test connection to Supabase

### Backend
- Supabase (Postgres + Auth + Storage)
- Row Level Security via is_admin() helper
- Auto-creates admin user during setup SQL
- 11 tables with indexes, foreign keys, and enums
- Storage bucket for images

---

## Security (as of 2026-10-10)

Three critical fixes applied and verified:

1. **Server-side price verification** — order totals are computed from DB prices, not client-supplied prices. Attack tested: sending unit_price:1 resulted in the real DB price being used.
2. **Order tracking via random token** — customers view their order via /orders/[token] where the token is a 20-char crypto-random string. Order numbers can no longer be enumerated.
3. **Magic-byte upload validation** — file uploads are verified by inspecting the first bytes (PNG/JPEG/GIF/WEBP signatures), not the client-supplied MIME type.

No credentials in git history. .env.local is gitignored. Service role key never reaches the browser.

---

## Known Gaps (Not Blockers)

- Automatic payment verification — we use manual QR + owner verification by design
- Email notifications — not implemented (could add via Resend)
- Custom domain setup — done manually by customer on Vercel
- OG image for social sharing — not generated automatically
- Google Search Console auto-verification — customer does it manually (one-time, 5 min)
- Small favicon caching quirks in some browsers

---

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (Postgres + Auth + Storage + RLS)
- Zustand (cart + wizard state)
- react-hook-form + Zod
- Vercel (hosting)
- JSZip (client export)

---

## Local Dev

    # Boilerplate (port 3000)
    cd apps/boilerplate && pnpm dev

    # Builder (port 3001)
    cd apps/builder && pnpm dev

    # Sync template (after editing boilerplate)
    cd apps/builder && pnpm run sync-template

    # Redeploy
    cd apps/boilerplate && vercel --prod
    cd apps/builder && vercel --prod

---

## Status

**v1.0 COMPLETE.** All features working end-to-end. Security hardened. Both apps deployed.

**Ready for:** Real restaurant testing, first paying customer, landing page / sales.
