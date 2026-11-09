import { z } from "zod";

export const createTenantSchema = (messages: {
  requiredFullName: string;
  requiredPhone: string;
  invalidEmail: string;
  requiredNationalId: string;
  requiredLeaseStart: string;
}) =>
  z.object({
    full_name: z.string().min(1, messages.requiredFullName),
    phone: z.string().min(1, messages.requiredPhone),
    email: z.string().email(messages.invalidEmail).optional().or(z.literal("")),
    national_id: z.string().min(1, messages.requiredNationalId),
    address: z.string().optional().or(z.literal("")),
    room_id: z.string().optional().or(z.literal("")),
    lease_start_date: z.string().min(1, messages.requiredLeaseStart),
    lease_end_date: z.string().optional().or(z.literal("")),
    deposit_amount: z.coerce.number().min(0).default(0),
  });
export type TenantFormInput = z.input<ReturnType<typeof createTenantSchema>>;
export type TenantInput = z.output<ReturnType<typeof createTenantSchema>>;
