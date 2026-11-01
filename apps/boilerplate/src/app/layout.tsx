import type { Metadata } from "next";
import {
  DM_Serif_Display,
  Inter,
  Lora,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { restaurantConfig, themeToCssVars } from "@/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  weight: "400",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const fontVariables: Record<string, string> = {
  Inter: "var(--font-inter)",
  "Playfair Display": "var(--font-playfair-display)",
  Poppins: "var(--font-poppins)",
  "DM Serif Display": "var(--font-dm-serif-display)",
  Lora: "var(--font-lora)",
};

export const metadata: Metadata = {
  title: restaurantConfig.seo.title,
  description: restaurantConfig.seo.description,
  keywords: restaurantConfig.seo.keywords,
  icons: {
    icon: restaurantConfig.brand.faviconUrl,
  },
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

  const themeVars = {
    ...themeToCssVars(cfg),
    "--font-heading":
      fontVariables[cfg.theme.fontHeading] ??
      fontVariables["Playfair Display"],
    "--font-body":
      fontVariables[cfg.theme.fontBody] ?? fontVariables.Inter,
    "--primary-foreground": getContrastColor(cfg.theme.primaryColor),
    "--accent-foreground": getContrastColor(cfg.theme.accentColor),
    "--ring": cfg.theme.primaryColor,
  } as React.CSSProperties;

  const fontClasses = [
    inter.variable,
    playfair.variable,
    poppins.variable,
    dmSerifDisplay.variable,
    lora.variable,
  ].join(" ");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontClasses} antialiased`}
        style={themeVars}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
