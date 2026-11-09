import { z } from "zod";

export const createPaymentSchema = (messages: { positiveAmount: string }) =>
  z.object({
    bill_id: z.string().min(1),
    amount: z.coerce.number().gt(0, messages.positiveAmount),
    method: z.enum(["cash", "bank_transfer"]),
    payment_date: z.string().optional().or(z.literal("")),
    transaction_code: z.string().optional().or(z.literal("")),
  });
export type PaymentFormInput = z.input<ReturnType<typeof createPaymentSchema>>;
export type PaymentInput = z.output<ReturnType<typeof createPaymentSchema>>;

export const createBankAccountSchema = (messages: {
  invalidBank: string;
  invalidAccountNumber: string;
  invalidAccountName: string;
}) =>
  z.object({
    bank_bin: z.string().regex(/^\d{6}$/, messages.invalidBank),
    bank_name: z.string().min(2, messages.invalidBank),
    account_number: z
      .string()
      .regex(/^\d{1,20}$/, messages.invalidAccountNumber),
    account_name: z
      .string()
      .trim()
      .min(2, messages.invalidAccountName)
      .max(100),
  });
export type BankAccountFormInput = z.input<
  ReturnType<typeof createBankAccountSchema>
>;
export type BankAccountInput = z.output<
  ReturnType<typeof createBankAccountSchema>
>;
