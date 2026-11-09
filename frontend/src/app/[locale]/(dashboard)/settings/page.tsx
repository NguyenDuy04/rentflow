"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { createPricingSchema, type PricingFormInput, type PricingInput } from "@/schemas/pricing";
import { createProfileSchema, type ProfileInput, createChangePasswordSchema, type ChangePasswordInput } from "@/schemas/auth";
import {
  useBankAccountSettings,
  useUpdateBankAccountSettings,
  useVietQrBanks,
} from "@/hooks/use-payments";
import { usePricing, useUpdatePricing } from "@/hooks/use-pricing";
import { useMe, useUpdateProfile, useChangePassword } from "@/hooks/use-auth";
import { createBankAccountSchema, type BankAccountFormInput, type BankAccountInput } from "@/schemas/payment";
import { ApiError } from "@/lib/api-client";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("settings");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <Tabs defaultValue="pricing">
        <TabsList>
          <TabsTrigger value="pricing">{t("tabs.pricing")}</TabsTrigger>
          <TabsTrigger value="bankAccount">{t("tabs.bankAccount")}</TabsTrigger>
          <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
          <TabsTrigger value="password">{t("tabs.password")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <PricingSettings />
        </TabsContent>
        <TabsContent value="bankAccount">
          <BankAccountSettingsForm />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="password">
          <PasswordSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BankAccountSettingsForm() {
  const t = useTranslations("settings.bankAccount");
  const common = useTranslations("common");
  const bankAccountSchema = createBankAccountSchema({
    invalidBank: t("invalidBank"),
    invalidAccountNumber: t("invalidAccountNumber"),
    invalidAccountName: t("invalidAccountName"),
  });
  const { data: bankAccount, isLoading } = useBankAccountSettings();
  const banks = useVietQrBanks();
  const updateBankAccount = useUpdateBankAccountSettings();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BankAccountFormInput, unknown, BankAccountInput>({
    resolver: zodResolver(bankAccountSchema),
  });

  useEffect(() => {
    if (bankAccount) reset({ ...bankAccount, bank_name: bankAccount.bank_name || "" });
  }, [bankAccount, reset]);

  const selectedBankBin = useWatch({ control, name: "bank_bin" });
  const selectedBank = banks.data?.find((bank) => bank.bin === selectedBankBin);

  useEffect(() => {
    if (bankAccount?.bank_bin && !bankAccount.bank_name && selectedBank) {
      setValue("bank_name", selectedBank.shortName);
    }
  }, [bankAccount, selectedBank, setValue]);

  const bankBinField = register("bank_bin", {
    onChange: (event) => {
      const bank = banks.data?.find((item) => item.bin === event.target.value);
      setValue("bank_name", bank?.shortName ?? "", { shouldValidate: true });
    },
  });

  const onSubmit = (data: BankAccountInput) => {
    updateBankAccount.mutate(data, {
      onSuccess: () => toast.success(t("saved")),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    });
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank_bin">{t("bank")}</Label>
            <Select
              id="bank_bin"
              options={(banks.data ?? []).map((bank) => ({
                value: bank.bin,
                label: bank.shortName,
              }))}
              placeholder={banks.isLoading ? t("loadingBanks") : t("chooseBank")}
              disabled={banks.isLoading || banks.isError}
              {...bankBinField}
            />
            {selectedBank && <p className="text-xs text-muted-foreground">{selectedBank.name}</p>}
            {banks.isError && <p className="text-xs text-destructive">{t("banksLoadFailed")}</p>}
            <input type="hidden" {...register("bank_name")} />
            {errors.bank_bin && <p className="text-xs text-destructive">{errors.bank_bin.message}</p>}
            {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account_number">{t("accountNumber")}</Label>
            <Input id="account_number" inputMode="numeric" {...register("account_number")} />
            {errors.account_number && <p className="text-xs text-destructive">{errors.account_number.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account_name">{t("accountName")}</Label>
            <Input id="account_name" autoComplete="off" {...register("account_name")} />
            {errors.account_name && <p className="text-xs text-destructive">{errors.account_name.message}</p>}
          </div>
          <Button type="submit" disabled={updateBankAccount.isPending}>
            {updateBankAccount.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PricingSettings() {
  const t = useTranslations("settings.pricing");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const pricingSchema = createPricingSchema({ invalidPrice: validation("invalidPrice") });
  const { data: pricing, isLoading } = usePricing();
  const updatePricing = useUpdatePricing();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PricingFormInput, unknown, PricingInput>({ resolver: zodResolver(pricingSchema) });

  useEffect(() => {
    if (pricing) reset(pricing);
  }, [pricing, reset]);

  const onSubmit = (data: PricingInput) => {
    updatePricing.mutate(data, {
      onSuccess: () => toast.success(t("saved")),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    });
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="electricity_price">{t("electricity")}</Label>
              <Input id="electricity_price" type="number" step="100" {...register("electricity_price")} />
              {errors.electricity_price && <p className="text-xs text-destructive">{errors.electricity_price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="water_price">{t("water")}</Label>
              <Input id="water_price" type="number" step="100" {...register("water_price")} />
              {errors.water_price && <p className="text-xs text-destructive">{errors.water_price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="internet_fee">{t("internet")}</Label>
              <Input id="internet_fee" type="number" step="1000" {...register("internet_fee")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parking_fee">{t("parking")}</Label>
              <Input id="parking_fee" type="number" step="1000" {...register("parking_fee")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cleaning_fee">{t("cleaning")}</Label>
              <Input id="cleaning_fee" type="number" step="1000" {...register("cleaning_fee")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="other_fee">{t("other")}</Label>
              <Input id="other_fee" type="number" step="1000" {...register("other_fee")} />
            </div>
          </div>
          <Button type="submit" disabled={updatePricing.isPending}>
            {updatePricing.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfileSettings() {
  const t = useTranslations("settings.profile");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const profileSchema = createProfileSchema({ requiredFullName: validation("requiredFullName") });
  const { data: user, isLoading } = useMe();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (user) reset({ full_name: user.full_name, phone: user.phone || "" });
  }, [user, reset]);

  const onSubmit = (data: ProfileInput) => {
    updateProfile.mutate(data, {
      onSuccess: () => toast.success(t("saved")),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    });
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <Label>{t("email")}</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="full_name">{t("fullName")}</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSettings() {
  const t = useTranslations("settings.password");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const changePasswordSchema = createChangePasswordSchema({
    requiredCurrentPassword: validation("requiredPassword"),
    passwordMinLength: validation("passwordMinLength"),
    requiredConfirmPassword: validation("requiredConfirmPassword"),
    passwordMismatch: validation("passwordMismatch"),
  });
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = (data: ChangePasswordInput) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        toast.success(t("saved"));
        reset();
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">{t("current")}</Label>
            <Input id="current_password" type="password" {...register("current_password")} />
            {errors.current_password && <p className="text-xs text-destructive">{errors.current_password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">{t("new")}</Label>
            <Input id="new_password" type="password" {...register("new_password")} />
            {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">{t("confirm")}</Label>
            <Input id="confirm_password" type="password" {...register("confirm_password")} />
            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
