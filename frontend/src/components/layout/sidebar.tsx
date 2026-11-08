"use client";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, DoorOpen, Users, Gauge, Receipt, Wallet, Settings, ScrollText, Wrench, UserRoundCog, House } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-auth";

export function Sidebar(
  { className, onNavigate, }
    :
    { className?: string; onNavigate?: () => void; }
) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.sidebar");
  const { data: user } = useMe();
  const ownerItems = [
    { href: "/dashboard", label: t("overview"), icon: LayoutDashboard, },
    { href: "/rooms", label: t("rooms"), icon: DoorOpen, },
    { href: "/tenants", label: t("tenants"), icon: Users, },
    { href: "/meters", label: t("meters"), icon: Gauge, },
    { href: "/billing", label: t("billing"), icon: Receipt, },
    { href: "/payments", label: t("payments"), icon: Wallet, },
    { href: "/settings", label: t("settings"), icon: Settings, },
    { href: "/team", label: t("team"), icon: UserRoundCog, },
    { href: "/audit", label: t("audit"), icon: ScrollText, },
    { href: "/issues", label: t("issues"), icon: Wrench, },
  ];
  const staffItems = [
    { href: "/dashboard", label: t("overview"), icon: LayoutDashboard },
    { href: "/rooms", label: t("rooms"), icon: DoorOpen },
    { href: "/tenants", label: t("tenants"), icon: Users },
    { href: "/billing", label: t("billing"), icon: Receipt },
    { href: "/payments", label: t("payments"), icon: Wallet },
    { href: "/audit", label: t("audit"), icon: ScrollText },
    { href: "/issues", label: t("issues"), icon: Wrench },
  ];
  const tenantItems = [{ href: "/tenant", label: t("tenantPortal"), icon: House }];
  const NAV_ITEMS = user?.role === "tenant" ? tenantItems : user?.role === "staff" ? staffItems : ownerItems;
  return (
    <div className={cn("flex h-full flex-col bg-primary text-primary-foreground", className)}>
      <div className="flex h-16 items-center gap-2 px-5">
        <Image src="/logo/rentflow__logo.svg" alt="logo_avatar" width={32} height={32} className="rounded-md bg-white p-0.5" loading="lazy" aria-hidden="true" />
        <span className="text-lg font-semibold tracking-tight"> {t("brand")} </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]", active ? "bg-white/15 text-white" : "text-primary-foreground/70 hover:bg-white/10 hover:text-white")}>
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", active && "scale-110")} />
              {item.label}
            </Link>);
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-primary-foreground/50"> {t("footer")} </div>
    </div>
  );
}