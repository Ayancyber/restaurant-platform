import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { restaurantConfig, themeToCssVars } from "@/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: restaurantConfig.seo.title,
  description: restaurantConfig.seo.description,
  keywords: restaurantConfig.seo.keywords,
};

function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0a0a" : "#ffffff";
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cfg = restaurantConfig;
  const primaryFg = getContrastColor(cfg.theme.primaryColor);
  const accentFg = getContrastColor(cfg.theme.accentColor);

  const themeVars = [
    `--primary: ${cfg.theme.primaryColor} !important;`,
    `--accent: ${cfg.theme.accentColor} !important;`,
    `--radius: ${cfg.theme.radius} !important;`,
    `--primary-foreground: ${primaryFg} !important;`,
    `--accent-foreground: ${accentFg} !important;`,
    `--ring: ${cfg.theme.primaryColor} !important;`,
  ].join(" ");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { ${themeVars} }`,
          }}
        />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
