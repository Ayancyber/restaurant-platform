import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: settings.seo.title,
    description: settings.seo.description,
    keywords: settings.seo.keywords,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar settings={settings} />
      <main className="flex-1 page-enter">{children}</main>
      <Footer settings={settings} />
      <CartDrawer currency={settings.currency} />
    </div>
  );
}
