import { NextResponse } from "next/server";
import { z } from "zod";
import { buildZip, getZipFilename } from "@/lib/export/zip-builder";
import type { WizardData } from "@/lib/store/wizard-store";

export const runtime = "nodejs"; // needed for Buffer + fs
export const dynamic = "force-dynamic";
export const maxDuration = 60; // allow up to 60s for ZIP generation

const dataSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    heroPunchline: z.string(),
    logoDataUrl: z.string(),
    faviconDataUrl: z.string().optional().default(""),
  }),
  theme: z.object({
    primaryColor: z.string(),
    accentColor: z.string(),
    fontHeading: z.string(),
    fontBody: z.string(),
  }),
  contact: z.object({
    phone: z.string(),
    email: z.string(),
    address: z.string(),
  }),
  hours: z.array(
    z.object({
      day: z.string(),
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    })
  ),
  features: z.object({
    onlineOrdering: z.boolean(),
    reservations: z.boolean(),
    gallery: z.boolean(),
  }),
  paymentAccounts: z.object({
    jazzcash: z.object({
      enabled: z.boolean(),
      accountName: z.string(),
      accountNumber: z.string(),
      qrCodeDataUrl: z.string(),
    }),
    easypaisa: z.object({
      enabled: z.boolean(),
      accountName: z.string(),
      accountNumber: z.string(),
      qrCodeDataUrl: z.string(),
    }),
    cod: z.object({ enabled: z.boolean() }),
  }),
  whatsapp: z.object({
    enabled: z.boolean(),
    number: z.string(),
  }),
  supabase: z.object({
    url: z.string(),
    anonKey: z.string(),
    serviceRoleKey: z.string(),
    verified: z.boolean(),
    adminEmail: z.string().optional().default(""),
    adminPassword: z.string().optional().default(""),
  }),
  currency: z.string(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // The wizard store shape may have extra internal fields (like _hasHydrated)
    // We only validate the parts we need
    const parsed = dataSchema.safeParse(body.data ?? body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid wizard data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Require Supabase URL + anon key at minimum
    if (!parsed.data.supabase.url || !parsed.data.supabase.anonKey) {
      return NextResponse.json(
        {
          error:
            "Missing Supabase credentials. Please complete Step 6 (Database) first.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data as unknown as WizardData;
    const zipBuffer = await buildZip(data);
    const zipBytes = new Uint8Array(zipBuffer);
    const filename = getZipFilename(data);

    return new NextResponse(zipBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown export error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
