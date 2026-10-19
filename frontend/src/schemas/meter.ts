import { z } from "zod";

export const createMeterSchema = (messages: {
  requiredRoom: string;
  requiredMonth: string;
  invalidReading: string;
  electricityReadingOrder: string;
  waterReadingOrder: string;
}) =>
  z
    .object({
      room_id: z.string().min(1, messages.requiredRoom),
      month: z.string().min(1, messages.requiredMonth),
      electricity_old: z.coerce.number().min(0, messages.invalidReading),
      electricity_new: z.coerce.number().min(0, messages.invalidReading),
      water_old: z.coerce.number().min(0, messages.invalidReading),
      water_new: z.coerce.number().min(0, messages.invalidReading),
    })
    .refine((d) => d.electricity_new >= d.electricity_old, {
      message: messages.electricityReadingOrder,
      path: ["electricity_new"],
    })
    .refine((d) => d.water_new >= d.water_old, {
      message: messages.waterReadingOrder,
      path: ["water_new"],
    });
export type MeterFormInput = z.input<ReturnType<typeof createMeterSchema>>;
export type MeterInput = z.output<ReturnType<typeof createMeterSchema>>;
