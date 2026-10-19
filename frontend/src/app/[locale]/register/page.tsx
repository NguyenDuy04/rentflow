"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthLayout } from "@/components/layout/auth-layout";
import { createRegisterSchema, type RegisterInput } from "@/schemas/auth";
import { useRegister, useSetupStatus } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api-client";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
    const router = useRouter();
    const { data: setupStatus, isLoading } = useSetupStatus();
    const registerAccount = useRegister();
    const t = useTranslations('auth.register');
    const validation = useTranslations("auth.validation");
    const schema = createRegisterSchema({
        requiredFullName: validation("requiredFullName"),
        invalidEmail: validation("invalidEmail"),
        passwordMinLength: validation("passwordMinLength"),
        requiredConfirmPassword: validation("requiredConfirmPassword"),
        passwordMismatch: validation("passwordMismatch"),
    });

    useEffect(() => {
        api
            .get("/auth/me")
            .then(() => router.replace("/dashboard"))
            .catch(() => undefined);
    }, [router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(schema),
        defaultValues: { full_name: "", email: "", password: "", confirm_password: "" },
    });

    const onSubmit = (data: RegisterInput) => {
        registerAccount.mutate(data, {
            onSuccess: () => toast.success(t("registerSuccess")),
            onError: (err) => toast.error(
                err instanceof ApiError
                    ? err.message
                    : t("registerFailed")
            ),
        });
    };

    return (
        <AuthLayout
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
        >
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="mx-auto h-6 w-40" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : setupStatus && !setupStatus.needs_setup ? (
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">
                            {t("systemConfiguredTitle")}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t("systemConfiguredDescription")}
                        </p>
                    </div>
                    <Button asChild className="w-full">
                        <Link href="/login">
                            {t("goToLogin")}
                        </Link>
                    </Button>
                </div>
            ) : (
                <>
                    <div className="mb-6 space-y-1 text-center lg:text-left">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            {t("createAccountTitle")}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t("createAccountDescription")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="full_name">
                                {t("fullName")}
                            </Label>
                            <Input id="full_name" autoComplete="name" {...register("full_name")} />
                            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">
                                {t("email")}
                            </Label>
                            <Input id="email" type="email" placeholder={t("emailPlaceholder")} autoComplete="email" {...register("email")} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">
                                {t("password")}
                            </Label>
                            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirm_password">
                                {t("confirmPassword")}
                            </Label>
                            <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
                            {errors.confirm_password && (
                                <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={registerAccount.isPending}
                        >
                            {registerAccount.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {t("submit")}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        {t("alreadyHaveAccount")}{" "}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            {t("login")}
                        </Link>
                    </p>
                </>
            )}
        </AuthLayout>
    );
}
