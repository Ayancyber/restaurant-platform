import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { LoginClient } from "./login-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: settings.seo.title,
    description: settings.seo.description,
    keywords: settings.seo.keywords,
  };
}

export default async function LoginPage() {
  const settings = await getSettings();

  return (
    <LoginClient
      brandName={settings.brand.name}
      brandLogoUrl={settings.brand.logoUrl}
    />
  );
}
