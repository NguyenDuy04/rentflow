import { z } from "zod";

export const createGenerateBillSchema = (messages: { requiredMonth: string }) =>
  z.object({
    month: z.string().min(1, messages.requiredMonth),
    room_id: z.string().optional().or(z.literal("")),
  });
export type GenerateBillInput = z.infer<
  ReturnType<typeof createGenerateBillSchema>
>;
