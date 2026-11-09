import { z } from "zod";

export const createPricingSchema = (messages: { invalidPrice: string }) =>
  z.object({
    electricity_price: z.coerce.number().min(0, messages.invalidPrice),
    water_price: z.coerce.number().min(0, messages.invalidPrice),
    internet_fee: z.coerce.number().min(0).default(0),
    parking_fee: z.coerce.number().min(0).default(0),
    cleaning_fee: z.coerce.number().min(0).default(0),
    other_fee: z.coerce.number().min(0).default(0),
  });
export type PricingFormInput = z.input<ReturnType<typeof createPricingSchema>>;
export type PricingInput = z.output<ReturnType<typeof createPricingSchema>>;
