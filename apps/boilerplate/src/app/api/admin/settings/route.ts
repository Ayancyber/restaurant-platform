import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const settingsSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string().optional(),
    heroPunchline: z.string().optional(),
    logoUrl: z.string().optional(),
  }).optional(),
  contact: z.object({
    phone: z.string(),
    email: z.string(),
    address: z.string(),
  }).optional(),
  hours: z.array(
    z.object({
      day: z.string(),
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    })
  ).optional(),
  social: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
  }).optional(),
  paymentAccounts: z.object({
    jazzcash: z.object({
      enabled: z.boolean(),
      accountName: z.string(),
      accountNumber: z.string(),
      qrCodeUrl: z.string().optional(),
    }),
    easypaisa: z.object({
      enabled: z.boolean(),
      accountName: z.string(),
      accountNumber: z.string(),
      qrCodeUrl: z.string().optional(),
    }),
    bank: z.object({
      enabled: z.boolean(),
      bankName: z.string(),
      accountTitle: z.string(),
      accountNumber: z.string(),
      iban: z.string(),
    }),
  }).optional(),
  whatsapp: z.object({
    enabled: z.boolean(),
    number: z.string(),
  }).optional(),
});

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;
  return user;
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const data = parsed.data;

    const rows = Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data to save" }, { status: 400 });
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      console.error("Settings upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
