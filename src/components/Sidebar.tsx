"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PieChart,
  ShieldCheck,
  Settings as SettingsIcon,
  Wallet,
  Copy,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Nullable<T> = T | null | undefined;

interface SidebarUser {
  name?: string;
  address?: string;
  avatarUrl?: string;
  email?: string;
}

export interface SidebarProps {
  className?: string;
  style?: React.CSSProperties;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  isOwner?: boolean;
  user?: SidebarUser;
  walletConnected?: boolean;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  // Optional: override default routes
  routes?: {
    dashboard?: string;
    holdings?: string;
    admin?: string;
    settings?: string;
  };
}

function cn(...classes: Array<Nullable<string> | Record<string, boolean>>): string {
  const flat: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === "string") flat.push(c);
    else for (const k in c) if (c[k]) flat.push(k);
  }
  return flat.join(" ");
}

function initials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  const [a, b] = [parts[0], parts[1]];
  return (a?.[0] ?? "") + (b?.[0] ?? "");
}

function shortAddress(addr?: string) {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Sidebar({
  className,
  style,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  isOwner = false,
  user,
  walletConnected = false,
  onConnectWallet,
  onDisconnectWallet,
  routes,
}: SidebarProps) {
  const pathname = usePathname();
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(false);
  const collapsed = controlledCollapsed ?? uncontrolledCollapsed;

  const setCollapsed = React.useCallback(
    (val: boolean) => {
      if (onCollapsedChange) onCollapsedChange(val);
      else setUncontrolledCollapsed(val);
    },
    [onCollapsedChange]
  );

  const navItems = React.useMemo(
    () => [
      {
        key: "dashboard",
        href: routes?.dashboard ?? "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        key: "holdings",
        href: routes?.holdings ?? "/holdings",
        label: "Holdings",
        icon: PieChart,
      },
      ...(isOwner
        ? [
            {
              key: "admin",
              href: routes?.admin ?? "/admin",
              label: "Admin",
              icon: ShieldCheck,
            },
          ]
        : []),
      {
        key: "settings",
        href: routes?.settings ?? "/settings",
        label: "Settings",
        icon: SettingsIcon,
      },
    ],
    [isOwner, routes]
  );

  function isActive(href: string) {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const UserBlock = (
    <div
      className={cn(
        "group/user rounded-lg bg-[--surface-1] border border-sidebar-border",
        "px-3 py-3 transition-colors"
      )}
      role="region"
      aria-label="User profile"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-1 ring-sidebar-border">
          {user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user?.name ?? "User"} />
          ) : null}
          <AvatarFallback className="bg-[--surface-2] text-foreground">
            {initials(user?.name)}
          </AvatarFallback>
        </Avatar>

        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium leading-none text-foreground">{user?.name ?? "Guest"}</p>
              {isOwner ? (
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-sidebar-accent text-sidebar-accent-foreground">
                  Owner
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  walletConnected
                    ? "bg-[--surface-2] text-[--success]"
                    : "bg-[--surface-2] text-muted-foreground"
                )}
                aria-live="polite"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    walletConnected ? "bg-[--success]" : "bg-muted-foreground"
                  )}
                />
                {walletConnected ? "Connected" : "Disconnected"}
              </span>

              {walletConnected && user?.address ? (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(user.address as string)
                      .then(() => toast.success("Address copied"))
                      .catch(() => toast.error("Failed to copy"));
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs",
                    "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  )}
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="truncate">{shortAddress(user.address)}</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "ml-auto shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground",
                  "hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                )}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronsRight className="h-4 w-4" />
                ) : (
                  <ChevronsLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground border-sidebar-border">
              {collapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!collapsed ? (
        <div className="mt-3 flex items-center gap-2">
          {walletConnected ? (
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "h-8 border border-sidebar-border bg-[--surface-2] text-foreground",
                "hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              )}
              onClick={
                onDisconnectWallet
                  ? () => onDisconnectWallet()
                  : undefined
              }
              disabled={!onDisconnectWallet}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className={cn(
                "h-8 bg-primary text-primary-foreground",
                "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              )}
              onClick={onConnectWallet ? () => onConnectWallet() : undefined}
              disabled={!onConnectWallet}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "flex h-full flex-col",
        collapsed ? "w-[4.25rem]" : "w-72",
        "transition-[width] duration-300 ease-out",
        className
      )}
      style={style}
      aria-label="Sidebar"
    >
      <div className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md",
              "bg-gradient-to-br from-primary to-[--chart-4]",
              "ring-1 ring-sidebar-ring/40"
            )}
            aria-hidden="true"
          >
            <span className="font-heading text-sm text-primary-foreground">F</span>
          </div>
          {!collapsed ? (
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
                Finomic
              </span>
              <span className="text-xs text-muted-foreground">v1</span>
            </div>
          ) : null}
        </div>

        {UserBlock}
      </div>

      <Separator className="mx-3 my-1 bg-sidebar-border" />

      <nav role="navigation" aria-label="Primary" className="px-2 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const baseClasses =
              "group/nav relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm outline-none transition-colors";
            return (
              <li key={item.key}>
                <TooltipProvider delayDuration={200}>
                  <Tooltip disableHoverableContent={!collapsed}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          baseClasses,
                          active
                            ? "bg-sidebar-accent text-foreground ring-1 ring-sidebar-ring/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            active ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground"
                          )}
                          aria-hidden="true"
                        />
                        {!collapsed ? (
                          <span className="truncate">{item.label}</span>
                        ) : (
                          <span className="sr-only">{item.label}</span>
                        )}
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        ) : null}
                      </Link>
                    </TooltipTrigger>
                    {collapsed ? (
                      <TooltipContent
                        side="right"
                        className="bg-popover text-popover-foreground border-sidebar-border"
                      >
                        {item.label}
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-3">
        {!collapsed ? (
          <div className="rounded-lg border border-sidebar-border bg-[--surface-1] p-3">
            <p className="text-xs text-muted-foreground">
              Secure by design. Manage your portfolio with confidence.
            </p>
          </div>
        ) : (
          <div
            className="grid h-10 w-10 place-items-center rounded-md bg-[--surface-1] border border-sidebar-border"
            aria-hidden="true"
          >
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </aside>
  );
}