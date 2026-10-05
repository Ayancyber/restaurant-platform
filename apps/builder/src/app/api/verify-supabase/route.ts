import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  url: z.string().url(),
  anonKey: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid URL or key format" },
        { status: 400 }
      );
    }

    const { url, anonKey } = parsed.data;

    // Basic JWT shape check for anon key
    const keyParts = anonKey.split(".");
    if (keyParts.length !== 3) {
      return NextResponse.json(
        { ok: false, error: "Anon key doesn't look like a valid JWT" },
        { status: 400 }
      );
    }

    try {
      const payload = JSON.parse(
        Buffer.from(keyParts[1], "base64").toString()
      );
      if (payload.role !== "anon") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "This looks like a service_role key — use the anon public key instead (found on the same Settings → API page)",
          },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "Couldn't decode anon key" },
        { status: 400 }
      );
    }

    // Ping the REST endpoint for site_settings table
    const restUrl = `${url.replace(/\/$/, "")}/rest/v1/site_settings?select=key&limit=1`;

    const res = await fetch(restUrl, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      // 8-second timeout
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) {
      return NextResponse.json({
        ok: false,
        error:
          "Connected to Supabase, but the site_settings table doesn't exist yet. Did you run the SQL?",
      });
    }

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({
        ok: false,
        error: "Connected to Supabase, but the anon key was rejected. Double-check you copied it correctly.",
      });
    }

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({
        ok: false,
        error: `Supabase returned status ${res.status}: ${text.slice(0, 120)}`,
      });
    }

    const data = await res.json();
    const hasSettings = Array.isArray(data);

    if (!hasSettings) {
      return NextResponse.json({
        ok: false,
        error: "Connected but unexpected response. Make sure you ran the full SQL.",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Connected successfully. Tables verified.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      ok: false,
      error:
        message.includes("fetch")
          ? "Couldn't reach Supabase. Check the URL and your internet."
          : `Verification failed: ${message}`,
    });
  }
}
