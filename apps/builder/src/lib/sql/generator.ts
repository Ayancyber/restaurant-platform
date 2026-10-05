import type { WizardData } from "@/lib/store/wizard-store";

/**
 * Composes the full Supabase SQL setup script based on
 * which features the user enabled.
 */
export function generateSQL(data: WizardData): string {
  const { features, brand } = data;

  const sections: string[] = [];

  sections.push(header(brand.name));
  sections.push(extensions());
  sections.push(baseTables());

  if (features.onlineOrdering) sections.push(ordersTables());
  if (features.reservations) sections.push(reservationsTable());
  if (features.gallery) sections.push(galleryTable());
  if (features.reviews) sections.push(reviewsTable());
  if (features.newsletter) sections.push(newsletterTable());

  sections.push(siteSettingsTable());
  sections.push(contactMessagesTable());
  sections.push(galleryStorageSetup());

  sections.push(profilesAndTriggers());
  sections.push(rlsPolicies(features));
  sections.push(seedData(data));

  return sections.join("\n\n");
}

function header(name: string) {
  return `-- =====================================================================
-- Restaurant Website Database Setup
-- Generated for: ${name || "Your Restaurant"}
-- Generated at: ${new Date().toISOString()}
-- =====================================================================
-- 
-- HOW TO USE:
-- 1. Copy this entire file
-- 2. Go to your Supabase project → SQL Editor
-- 3. Paste and click RUN
-- 4. Wait for "Success" message
-- =====================================================================`;
}

function extensions() {
  return `-- Enable required extensions
create extension if not exists "uuid-ossp";`;
}

function baseTables() {
  return `-- =====================================================================
-- MENU CATEGORIES + ITEMS (always included)
-- =====================================================================

create table if not exists public.menu_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  tags text[] default '{}',
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_menu_items_category on public.menu_items(category_id);
create index if not exists idx_menu_items_featured on public.menu_items(is_featured) where is_featured = true;`;
}

function ordersTables() {
  return `-- =====================================================================
-- ORDERS + ORDER ITEMS
-- =====================================================================

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  type text not null check (type in ('pickup', 'delivery', 'dine-in')),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('jazzcash', 'easypaisa', 'cod')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  customer_marked_paid_at timestamptz,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  delivery_address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- Auto-generate order numbers like ORD-20261005-0001
create sequence if not exists order_number_seq start 1;

create or replace function public.generate_order_number()
returns text as $$
declare
  seq_val int;
  date_part text;
begin
  seq_val := nextval('order_number_seq');
  date_part := to_char(now(), 'YYYYMMDD');
  return 'ORD-' || date_part || '-' || lpad(seq_val::text, 4, '0');
end;
$$ language plpgsql;

create or replace function public.set_order_number()
returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_order_number on public.orders;
create trigger trg_set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();`;
}

function reservationsTable() {
  return `-- =====================================================================
-- RESERVATIONS
-- =====================================================================

create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  party_size int not null check (party_size > 0),
  reservation_date date not null,
  reservation_time time not null,
  special_requests text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reservations_date on public.reservations(reservation_date);
create index if not exists idx_reservations_status on public.reservations(status);`;
}

function galleryTable() {
  return `-- =====================================================================
-- GALLERY
-- =====================================================================

create table if not exists public.gallery (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  image_url text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);`;
}

function reviewsTable() {
  return `-- =====================================================================
-- REVIEWS
-- =====================================================================

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);`;
}

function newsletterTable() {
  return `-- =====================================================================
-- NEWSLETTER SUBSCRIBERS
-- =====================================================================

create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);`;
}

function siteSettingsTable() {
  return `-- =====================================================================
-- SITE SETTINGS (admin-editable config)
-- =====================================================================

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);`;
}

function contactMessagesTable() {
  return `-- =====================================================================
-- CONTACT MESSAGES
-- =====================================================================

create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);`;
}

function galleryStorageSetup() {
  return `-- =====================================================================
-- STORAGE BUCKET for menu images + QR codes + gallery
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Allow public read
drop policy if exists "Public read gallery" on storage.objects;
create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

-- Allow authenticated users to upload
drop policy if exists "Auth upload gallery" on storage.objects;
create policy "Auth upload gallery"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery');

-- Allow authenticated users to update
drop policy if exists "Auth update gallery" on storage.objects;
create policy "Auth update gallery"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery');

-- Allow authenticated users to delete
drop policy if exists "Auth delete gallery" on storage.objects;
create policy "Auth delete gallery"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery');`;
}

function profilesAndTriggers() {
  return `-- =====================================================================
-- PROFILES (extends auth.users with role)
-- =====================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();`;
}

function rlsPolicies(features: WizardData["features"]) {
  const lines: string[] = [];

  lines.push(`-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
-- Public can READ, admins can WRITE. This is critical for security.`);

  const publicReadTables = [
    "menu_categories",
    "menu_items",
    "gallery",
    "reviews",
    "site_settings",
  ];
  if (features.onlineOrdering) publicReadTables.push("orders", "order_items");
  if (features.reservations) publicReadTables.push("reservations");

  for (const table of publicReadTables) {
    lines.push(`
alter table public.${table} enable row level security;

drop policy if exists "Public read ${table}" on public.${table};
create policy "Public read ${table}"
  on public.${table} for select
  using (true);`);
  }

  // Admin-only write tables
  const adminWriteTables = [
    "menu_categories",
    "menu_items",
    "gallery",
    "reviews",
    "site_settings",
    "contact_messages",
  ];
  if (features.onlineOrdering) adminWriteTables.push("orders", "order_items");
  if (features.reservations) adminWriteTables.push("reservations");

  for (const table of adminWriteTables) {
    lines.push(`
drop policy if exists "Admin write ${table}" on public.${table};
create policy "Admin write ${table}"
  on public.${table} for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );`);
  }

  // Public can insert (contact, reservations, orders)
  const publicInsertTables = ["contact_messages"];
  if (features.onlineOrdering) publicInsertTables.push("orders", "order_items");
  if (features.reservations) publicInsertTables.push("reservations");
  if (features.newsletter) publicInsertTables.push("newsletter_subscribers");

  for (const table of publicInsertTables) {
    lines.push(`
drop policy if exists "Public insert ${table}" on public.${table};
create policy "Public insert ${table}"
  on public.${table} for insert
  with check (true);`);
  }

  // Profiles: user can read own, admin can read all
  lines.push(`
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );`);

  return lines.join("\n");
}

function seedData(data: WizardData) {
  const { brand, contact, hours, features } = data;
  const name = brand.name || "Your Restaurant";
  const tagline = brand.tagline || "";
  const punchline = brand.heroPunchline || "";

  // Escape single quotes for SQL
  const esc = (s: string) => (s || "").replace(/'/g, "''");

  const settings = {
    brand: {
      name: name,
      tagline: tagline,
      heroPunchline: punchline,
      logoUrl: brand.logoDataUrl || "/logo.svg",
      faviconUrl: "/favicon.ico",
    },
    contact: {
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      mapEmbedUrl: "",
    },
    hours: hours,
    seo: {
      title: name,
      description: tagline,
      keywords: [],
    },
    paymentAccounts: data.paymentAccounts,
    whatsapp: data.whatsapp,
    currency: data.currency,
  };

  const settingsJson = JSON.stringify(settings).replace(/'/g, "''");

  const parts: string[] = [];
  parts.push(`-- =====================================================================
-- SEED DATA
-- =====================================================================`);

  parts.push(`
insert into public.site_settings (key, value) values
  ('brand', '${JSON.stringify(settings.brand).replace(/'/g, "''")}'::jsonb),
  ('contact', '${JSON.stringify(settings.contact).replace(/'/g, "''")}'::jsonb),
  ('hours', '${JSON.stringify(settings.hours).replace(/'/g, "''")}'::jsonb),
  ('seo', '${JSON.stringify(settings.seo).replace(/'/g, "''")}'::jsonb),
  ('paymentAccounts', '${JSON.stringify(settings.paymentAccounts).replace(/'/g, "''")}'::jsonb),
  ('whatsapp', '${JSON.stringify(settings.whatsapp).replace(/'/g, "''")}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();`);

  parts.push(`
insert into public.menu_categories (name, description, sort_order) values
  ('Starters', 'Appetizers and small plates', 1),
  ('Main Course', 'Signature dishes', 2),
  ('Desserts', 'Sweet endings', 3),
  ('Beverages', 'Drinks and refreshments', 4)
on conflict do nothing;`);

  return parts.join("\n\n");
}

/**
 * Returns a lightweight table count for "Test Connection" verification.
 */
export const EXPECTED_TABLES = [
  "menu_categories",
  "menu_items",
  "site_settings",
  "contact_messages",
];
