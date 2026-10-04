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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {/* Inject theme from restaurant.config.json */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {${Object.entries(themeToCssVars(restaurantConfig))
              .map(([k, v]) => `${k}: ${v}`)
              .join(";")}}`,
          }}
        />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
