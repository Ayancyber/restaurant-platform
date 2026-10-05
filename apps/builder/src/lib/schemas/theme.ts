import { z } from "zod";

export const themeSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  fontHeading: z.string().min(1),
  fontBody: z.string().min(1),
});

export type ThemeFormData = z.infer<typeof themeSchema>;

export const FONT_OPTIONS = [
  { value: "Playfair Display", label: "Playfair Display (Elegant)" },
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Poppins", label: "Poppins (Friendly)" },
  { value: "DM Serif Display", label: "DM Serif (Classic)" },
  { value: "Lora", label: "Lora (Editorial)" },
];

export const COLOR_PRESETS = [
  { name: "Warm Italian", primary: "#c2410c", accent: "#facc15" },
  { name: "Modern Dark", primary: "#0f172a", accent: "#f59e0b" },
  { name: "Fresh Green", primary: "#15803d", accent: "#fbbf24" },
  { name: "Royal Purple", primary: "#7e22ce", accent: "#fbbf24" },
  { name: "Ocean Blue", primary: "#0369a1", accent: "#fbbf24" },
  { name: "Rose Gold", primary: "#be123c", accent: "#fcd34d" },
];
