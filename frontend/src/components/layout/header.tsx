"use client";

import { Link } from "@/i18n/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useMe, useLogout } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export function Header() {
  const t = useTranslations("dashboard.header");
  const { data: user } = useMe();
  const logout = useLogout();
  const initial = user?.full_name?.trim()?.[0]?.toUpperCase() || "?";
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-backdrop-filter:bg-card/80 sm:h-16 sm:px-6">
      <Link href={user?.role === "tenant" ? "/tenant" : "/dashboard"} className="flex items-center gap-2 lg:hidden">
        <Image src="/logo/rentflow__logo.svg" alt="" width={28} height={28} className="rounded-md bg-white p-0.5" aria-hidden="true" />
        <span className="text-base font-semibold tracking-tight"> {t("brand")} </span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md text-sm transition-colors duration-200 hover:bg-muted active:scale-[0.98]">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"> {initial} </div>
              <span className="hidden max-w-40 truncate font-medium sm:inline"> {user?.full_name || t("defaultUser")} </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user?.role === "owner" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="h-4 w-4" /> {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem destructive onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
