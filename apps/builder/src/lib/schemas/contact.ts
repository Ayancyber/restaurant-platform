import { z } from "zod";

export const contactSchema = z.object({
  phone: z.string().min(5, "Phone is required"),
  email: z
    .string()
    .email("Must be a valid email")
    .or(z.literal(""))
    .optional(),
  address: z.string().min(5, "Address is required"),
  instagram: z
    .string()
    .url("Enter a valid Instagram URL")
    .or(z.literal(""))
    .optional(),
  facebook: z
    .string()
    .url("Enter a valid Facebook URL")
    .or(z.literal(""))
    .optional(),
  hours: z
    .array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        closed: z.boolean(),
      })
    )
    .length(7, "Must have 7 days"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
