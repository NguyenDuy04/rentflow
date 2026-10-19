"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/auth-layout";
import { createLoginSchema, type LoginInput } from "@/schemas/auth";
import { useLogin } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api-client";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const router = useRouter();
    const login = useLogin();
    const t = useTranslations("auth.login");
    const validation = useTranslations("auth.validation");
    const schema = createLoginSchema({
        invalidEmail: validation("invalidEmail"),
        requiredPassword: validation("requiredPassword"),
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
    } = useForm<LoginInput>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "", remember: false },
    });

    const onSubmit = (data: LoginInput) => {
        login.mutate(data, {
            onError: (err) => {
                toast.error(err instanceof ApiError ? err.message : t("loginFailed"));
            },
        });
    };

    return (
        <AuthLayout
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}>
            <div className="mb-6 space-y-1 text-center lg:text-left">
                <h2 className="text-2xl font-semibold tracking-tight">{t("heading")}</h2>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-3">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input id="email" type="email" placeholder={t("emailPlaceholder")} autoComplete="email" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-3">
                    <Label htmlFor="password">{t("password")}</Label>
                    <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="flex items-center gap-2 cursor-pointer">
                    <input id="remember" type="checkbox" className="h-4 w-4 rounded border-input cursor-pointer" {...register("remember")} />
                    <Label htmlFor="remember" className="cursor-pointer font-normal text-muted-foreground">
                        {t("remember")}
                    </Label>
                </div>

                <Button type="submit" className="w-full" disabled={login.isPending}>
                    {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t("submit")}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                {t("firstTime")}{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                    {t("setupAccount")}
                </Link>
            </p>
        </AuthLayout>
    );
}
