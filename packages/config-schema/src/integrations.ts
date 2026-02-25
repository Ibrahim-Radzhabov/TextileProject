import { z } from "zod";

const stripeIntegration = z.object({
  type: z.literal("stripe"),
  publishableKey: z.string(),
  secretKey: z.string(),
  webhookSecret: z.string().optional()
});

const telegramIntegration = z.object({
  type: z.literal("telegram"),
  botToken: z.string(),
  chatId: z.string()
});

export const integrationsSchema = z.object({
  stripe: stripeIntegration.optional(),
  telegram: telegramIntegration.optional()
});

export type IntegrationsConfigInput = z.infer<typeof integrationsSchema>;

