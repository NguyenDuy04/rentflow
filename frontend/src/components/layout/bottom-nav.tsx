"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import {
  LayoutDashboard,
  DoorOpen,
  Users,
  Receipt,
  MoreHorizontal,
  Gauge,
  Wallet,
  Settings,
  ScrollText,
  Wrench,
  House,
  UserRoundCog,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NavIcon({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 active:scale-95 transition-transform"
    >
      <span
        className={cn(
          "flex h-8 w-11 items-center justify-center rounded-full transition-all duration-200",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            active && "scale-110"
          )}
        />
      </span>

      <span
        className={cn(
          "text-[11px] font-medium transition-colors duration-200",
          active
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboard.bottomNav");
  const { data: user } = useMe();

  const ownerPrimaryItems = [
    {
      href: "/dashboard",
      label: t("overview"),
      icon: LayoutDashboard,
    },
    {
      href: "/rooms",
      label: t("rooms"),
      icon: DoorOpen,
    },
    {
      href: "/tenants",
      label: t("tenants"),
      icon: Users,
    },
    {
      href: "/billing",
      label: t("billing"),
      icon: Receipt,
    },
  ];

  const ownerMoreItems = [
    {
      href: "/meters",
      label: t("meters"),
      icon: Gauge,
    },
    {
      href: "/payments",
      label: t("payments"),
      icon: Wallet,
    },
    {
      href: "/settings",
      label: t("settings"),
      icon: Settings,
    },
    { href: "/team", label: t("team"), icon: UserRoundCog },
    { href: "/audit", label: t("audit"), icon: ScrollText },
    { href: "/issues", label: t("issues"), icon: Wrench },
  ];
  const staffPrimaryItems = [
    { href: "/dashboard", label: t("overview"), icon: LayoutDashboard },
    { href: "/rooms", label: t("rooms"), icon: DoorOpen },
    { href: "/tenants", label: t("tenants"), icon: Users },
    { href: "/payments", label: t("payments"), icon: Wallet },
  ];
  const staffMoreItems = [
    { href: "/billing", label: t("billing"), icon: Receipt },
    { href: "/audit", label: t("audit"), icon: ScrollText },
    { href: "/issues", label: t("issues"), icon: Wrench },
  ];
  const tenantPrimaryItems = [{ href: "/tenant", label: t("tenantPortal"), icon: House }];
  const tenantMoreItems: typeof ownerMoreItems = [];
  const PRIMARY_ITEMS = user?.role === "tenant" ? tenantPrimaryItems : user?.role === "staff" ? staffPrimaryItems : ownerPrimaryItems;
  const MORE_ITEMS = user?.role === "tenant" ? tenantMoreItems : user?.role === "staff" ? staffMoreItems : ownerMoreItems;

  const isActive = (href: string) =>
    pathname === href ||
    pathname?.startsWith(href + "/");

  const moreActive = MORE_ITEMS.some((item) =>
    isActive(item.href)
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {PRIMARY_ITEMS.map((item) => (
        <NavIcon
          key={item.href}
          {...item}
          active={isActive(item.href)}
        />
      ))}

      {MORE_ITEMS.length > 0 && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 active:scale-95 transition-transform">
            <span
              className={cn(
                "flex h-8 w-11 items-center justify-center rounded-full transition-all duration-200",
                moreActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <MoreHorizontal
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  moreActive && "scale-110"
                )}
              />
            </span>

            <span
              className={cn(
                "text-[11px] font-medium transition-colors duration-200",
                moreActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {t("more")}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="end"
          className="mb-1 w-48"
        >
          {MORE_ITEMS.map((item) => (
            <DropdownMenuItem
              key={item.href}
              asChild
            >
              <Link
                href={item.href}
                className={cn(
                  isActive(item.href) &&
                  "text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>}
    </nav>
  );
}
