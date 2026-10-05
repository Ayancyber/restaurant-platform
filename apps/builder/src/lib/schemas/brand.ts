import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(60, "Name is too long"),
  tagline: z
    .string()
    .max(80, "Tagline is too long (max 80 characters)")
    .optional()
    .or(z.literal("")),
  heroPunchline: z
    .string()
    .max(120, "Punchline is too long (max 120 characters)")
    .optional()
    .or(z.literal("")),
  logoDataUrl: z.string().optional().or(z.literal("")),
});

export type BrandFormData = z.infer<typeof brandSchema>;
