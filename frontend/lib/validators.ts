import { z } from "zod";
import { DEPARTMENTS, GENDERS } from "@/lib/types";
import { normalizeKePhone } from "@/lib/phone";

export const bagLineSchema = z.object({
  productId: z.string().min(1),
  size: z.string().trim().min(1).max(40).nullable(),
  color: z.string().trim().min(1).max(40).nullable(),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z
  .object({
    items: z.array(bagLineSchema).min(1).max(30),
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(8).max(20),
    fulfillment: z.enum(["delivery", "pickup"]),
    area: z.string().trim().max(120).optional().default(""),
    street: z.string().trim().max(160).optional().default(""),
    note: z.string().trim().max(300).optional().default(""),
  })
  .superRefine((value, context) => {
    if (value.fulfillment === "delivery") {
      if (!value.area) context.addIssue({ code: "custom", path: ["area"], message: "Area or estate is required" });
      if (!value.street) context.addIssue({ code: "custom", path: ["street"], message: "Street or building is required" });
    }
    if (!normalizeKePhone(value.phone)) {
      context.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid Kenyan phone number" });
    }
  });

export const productInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(160),
  subtitle: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
  deliveryReturns: z.string().trim().min(1).max(4000),
  priceKes: z.number().positive().max(10_000_000),
  compareAtKes: z.number().positive().max(10_000_000).nullable(),
  badge: z.string().trim().max(40).nullable(),
  gender: z.enum(GENDERS),
  kids: z.boolean(),
  active: z.boolean(),
  departments: z
    .array(
      z.object({
        department: z.enum(DEPARTMENTS),
        category: z.string().trim().min(1).max(80),
      }),
    )
    .min(1),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        hex: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/, "Use a hex colour like #111111"),
      }),
    )
    .min(1),
  sizes: z.array(
    z.object({
      label: z.string().trim().min(1).max(40),
      inStock: z.boolean(),
    }),
  ),
  images: z
    .array(
      z.object({
        image: z.string().trim().min(1).max(500),
        alt: z.string().trim().max(160).default(""),
        colorName: z.string().trim().max(40).nullable(),
      }),
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;

export const settingsInputSchema = z.object({
  companyName: z.string().trim().min(1).max(80),
  logo: z.string().trim().min(1).max(500),
  announcement: z.string().trim().min(1).max(400),
  pickupAddress: z.string().trim().min(1).max(400),
  deliveryFeeKes: z.number().min(0).max(100_000),
  freeDeliveryThresholdKes: z.number().min(0).max(10_000_000),
});

export const heroInputSchema = z.object({
  id: z.string().min(1),
  eyebrow: z.string().trim().min(1).max(120),
  headline: z.string().trim().min(1).max(200),
  image: z.string().trim().min(1).max(500),
  buttonLabel: z.string().trim().min(1).max(40),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  department: z.enum(DEPARTMENTS),
});
