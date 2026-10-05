import { z } from "zod";

export const paymentsSchema = z.object({
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
  cod: z.object({
    enabled: z.boolean(),
  }),
  whatsapp: z.object({
    enabled: z.boolean(),
    number: z.string(),
  }),
});

export type PaymentsFormData = z.infer<typeof paymentsSchema>;
