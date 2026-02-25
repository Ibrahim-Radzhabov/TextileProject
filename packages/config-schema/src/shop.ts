import { z } from "zod";

export const shopSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logo: z
    .object({
      src: z.string().url(),
      alt: z.string().min(1)
    })
    .optional(),
  primaryLocale: z.string().min(2),
  currency: z.string().min(3).max(3)
});

export type ShopConfigInput = z.infer<typeof shopSchema>;

