import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { hasLocale } from "next-intl";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/provider/theme-provider";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    variable: "--font-inter",
});

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isEnglish = locale === "en";

    return {
        title: isEnglish ? "RentFlow - Rental Management" : "RentFlow - Quản lý phòng trọ",
        description: isEnglish
            ? "Manage rooms, tenants, utilities, bills, and payments."
            : "Hệ thống quản lý phòng trọ: phòng, người thuê, điện nước, hóa đơn và thanh toán.",
        icons: {
            icon: "/logo/rentflow__logo-removebg.png",
            apple: "/logo/rentflow__logo-removebg.png",
        },
    };
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} className={cn("h-full antialiased")} data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className={cn('h-full', inter.className, inter.variable)}>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <Providers>{children}</Providers>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}