import { z } from "zod";

// =====================================================
// ORDER SCHEMA
// =====================================================
export const orderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  item_name: z.string().min(1),
  unit_price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const orderSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  customer_phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone format"),
  customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
  type: z.enum(["pickup", "delivery", "dine-in"]),
  payment_method: z.enum(["jazzcash", "easypaisa", "cod"]),
  delivery_address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
});

export type OrderInput = z.infer<typeof orderSchema>;

// =====================================================
// RESERVATION SCHEMA
// =====================================================
export const reservationSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  customer_phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone format"),
  customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
  party_size: z.coerce.number().int().min(1).max(20),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  reservation_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  special_requests: z.string().optional().or(z.literal("")),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
