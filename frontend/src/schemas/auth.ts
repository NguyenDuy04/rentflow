import { z } from "zod";

export const createLoginSchema = (messages: {
  invalidEmail: string;
  requiredPassword: string;
}) =>
  z.object({
    email: z.string().email(messages.invalidEmail),
    password: z.string().min(1, messages.requiredPassword),
    remember: z.boolean(),
  });
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export const createRegisterSchema = (messages: {
  requiredFullName: string;
  invalidEmail: string;
  passwordMinLength: string;
  requiredConfirmPassword: string;
  passwordMismatch: string;
}) =>
  z
    .object({
      full_name: z.string().min(1, messages.requiredFullName),
      email: z.string().email(messages.invalidEmail),
      password: z.string().min(6, messages.passwordMinLength),
      confirm_password: z.string().min(1, messages.requiredConfirmPassword),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: messages.passwordMismatch,
      path: ["confirm_password"],
    });
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;

export const createProfileSchema = (messages: { requiredFullName: string }) =>
  z.object({
    full_name: z.string().min(1, messages.requiredFullName),
    phone: z.string().optional().or(z.literal("")),
  });
export type ProfileInput = z.infer<ReturnType<typeof createProfileSchema>>;

export const createChangePasswordSchema = (messages: {
  requiredCurrentPassword: string;
  passwordMinLength: string;
  requiredConfirmPassword: string;
  passwordMismatch: string;
}) =>
  z
    .object({
      current_password: z.string().min(1, messages.requiredCurrentPassword),
      new_password: z.string().min(6, messages.passwordMinLength),
      confirm_password: z.string().min(1, messages.requiredConfirmPassword),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: messages.passwordMismatch,
      path: ["confirm_password"],
    });
export type ChangePasswordInput = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
