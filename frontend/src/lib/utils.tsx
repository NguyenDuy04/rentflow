import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function intlLocale(locale: string): string {
    return locale === "en" ? "en-US" : "vi-VN";
}

export function formatCurrency(amount: number, locale = "vi"): string {
    return new Intl.NumberFormat(intlLocale(locale), {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

export function formatDate(value: string | Date, locale = "vi"): string {
    const d = typeof value === "string" ? new Date(value) : value;
    return new Intl.DateTimeFormat(intlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);
}

export function formatDateTime(value: string | Date, locale = "vi"): string {
    const d = typeof value === "string" ? new Date(value) : value;
    return new Intl.DateTimeFormat(intlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

export function monthLabel(month: string, locale = "vi"): string {
    const [y, m] = month.split("-");
    if (locale !== "en") return `Tháng ${parseInt(m, 10)}/${y}`;

    return new Intl.DateTimeFormat(intlLocale(locale), {
        month: "long",
        year: "numeric",
    }).format(new Date(Number(y), Number(m) - 1, 1));
}

export function currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
