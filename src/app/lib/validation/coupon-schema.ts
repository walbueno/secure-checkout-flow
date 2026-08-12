import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{4,12}$/, "Cupom deve conter entre 4 e 12 letras/números"),
});

export type CouponData = z.infer<typeof couponSchema>;