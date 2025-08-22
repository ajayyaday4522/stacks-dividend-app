"use client";

import * as React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Wallet, LogOut, Copy, ExternalLink, Loader2, Check } from "lucide-react";
import { showConnect } from "@stacks/connect";
import { AppConfig, UserSession, type UserData } from "@stacks/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    StacksProvider?: unknown;
  }
}

type Network = "mainnet" | "testnet";

export interface WalletConnectionProps {
  className?: string;
  appName?: string;
  appIconUrl?: string;
  network?: Network;
  showBalance?: boolean;
  addressTruncate?: number;
  onConnected?: (address: string) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
}

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function microToStacks(micro: string | number | bigint): number {
  try {
    const asString = micro.toString();
    // Use BigInt to avoid precision issues for large micro amounts, then to Number for display
    const micros = BigInt(asString);
    const integer = Number(micros / BigInt(1_000_000));
    const fractional = Number(micros % BigInt(1_000_000)) / 1_000_000;
    return integer + fractional;
  } catch {
    const num = Number(micro);
    return Number.isFinite(num) ? num / 1_000_000 : 0;
  }
}

function formatStx(amount: number | null, maximumFractionDigits = 4): string {
  if (amount === null || Number.isNaN(amount)) return "--";
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

function truncateMiddle(input: string, front = 6, back = 4): string {
  if (!input) return "";
  if (input.length <= front + back + 3) return input;
  return `${input.slice(0, front)}...${input.slice(-back)}`;
}

function getExplorerAddressUrl(network: Network, address: string) {
  const base =
    network === "mainnet"
      ? "https://explorer.hiro.so/address"
      : "https://explorer.hiro.so/address";
  const suffix = network === "mainnet" ? "" : "?chain=testnet";
  return `${base}/${address}${suffix}`;
}

function getAddressFromUserData(userData: UserData | null, network: Network): string | null {
  if (!userData) return null;
  // Stacks profile contains addresses by network key
  const key = network === "mainnet" ? "mainnet" : "testnet";
  const stxAddress =
    // @ts-expect-error - profile typing does not guarantee stxAddress shape
    userData?.profile?.stxAddress?.[key] ??
    // Fallback known keys casing variations
    // @ts-expect-error - non-standard
    userData?.profile?.stxAddress?.[key.toUpperCase()] ??
    null;
  return typeof stxAddress === "string" ? stxAddress : null;
}

export default function WalletConnection({
  className,
  style,
  appName = "Your App",
  appIconUrl,
  network = "mainnet",
  showBalance = true,
  addressTruncate = 6,
  onConnected,
  onDisconnected,
  onError,
}: WalletConnectionProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copyOk, setCopyOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    return network === "mainnet"
      ? "https://api.hiro.so"
      : "https://api.testnet.hiro.so";
  }, [network]);

  const refreshSessionState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (userSession.isSignInPending()) {
        const userData = await userSession.handlePendingSignIn();
        const addr = getAddressFromUserData(userData, network);
        setAddress(addr);
        if (addr) toast.success("Wallet connected");
        if (addr && onConnected) onConnected(addr);
      } else if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        const addr = getAddressFromUserData(userData, network);
        setAddress(addr);
      } else {
        setAddress(null);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to initialize wallet session";
      setError(message);
      if (onError && e instanceof Error) onError(e);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [network, onConnected, onError]);

  const fetchBalance = useCallback(
    async (addr: string) => {
      if (!addr) return;
      try {
        const res = await fetch(`${apiBase}/extended/v1/address/${addr}/balances`, {
          headers: { "accept": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to fetch balance (${res.status})`);
        const json = await res.json();
        const stxMicros = json?.stx?.balance ?? "0";
        setBalance(microToStacks(stxMicros));
      } catch (e) {
        setBalance(null);
        const message = e instanceof Error ? e.message : "Unable to load STX balance";
        setError(message);
        if (onError && e instanceof Error) onError(e);
        toast.error(message);
      }
    },
    [apiBase, onError]
  );

  useEffect(() => {
    void refreshSessionState();
  }, [refreshSessionState]);

  useEffect(() => {
    if (address) {
      void fetchBalance(address);
    } else {
      setBalance(null);
    }
  }, [address, fetchBalance, network]);

  const handleConnect = useCallback(() => {
    setIsConnecting(true);
    setError(null);

    const fallbackIcon =
      appIconUrl ||
      "https://assets.hiro.so/static/media/hiro-logo.3c27339f7dfefc1a0b7a.png";

    try {
      showConnect({
        appDetails: {
          name: appName,
          icon: fallbackIcon,
        },
        userSession,
        onFinish: () => {
          try {
            const userData = userSession.loadUserData();
            const addr = getAddressFromUserData(userData, network);
            setAddress(addr);
            if (addr) {
              void fetchBalance(addr);
              toast.success("Wallet connected");
              onConnected?.(addr);
            }
          } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to finalize connection";
            setError(message);
            if (onError && e instanceof Error) onError(e);
            toast.error(message);
          } finally {
            setIsConnecting(false);
          }
        },
        onCancel: () => {
          setIsConnecting(false);
          toast.message("Connection cancelled");
        },
      });
    } catch (e) {
      setIsConnecting(false);
      const message = e instanceof Error 
        ? e.message
        : (typeof window !== "undefined" && !window.StacksProvider
            ? "Hiro Wallet not detected. Please install the Hiro Web Wallet."
            : "Unable to open wallet");
      setError(message);
      if (onError && e instanceof Error) onError(e);
      toast.error(message);
    }
  }, [appIconUrl, appName, fetchBalance, network, onConnected, onError]);

  const handleDisconnect = useCallback(() => {
    try {
      userSession.signUserOut();
      setAddress(null);
      setBalance(null);
      toast.success("Wallet disconnected");
      onDisconnected?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to disconnect wallet";
      setError(message);
      if (onError && e instanceof Error) onError(e);
      toast.error(message);
    }
  }, [onDisconnected, onError]);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopyOk(true);
      toast.success("Address copied");
      const t = setTimeout(() => setCopyOk(false), 1200);
      return () => clearTimeout(t);
    } catch {
      toast.error("Failed to copy address");
    }
  }, [address]);

  const addrShort = address ? truncateMiddle(address, addressTruncate, 4) : "";
  const explorerUrl = address ? getExplorerAddressUrl(network, address) : "#";

  return (
    <div className={cn("inline-flex items-center gap-3", className)} style={style} aria-live="polite">
      {address ? (
        <>
          {showBalance && (
            <div
              className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--surface-1)] px-3 py-1.5"
              aria-label="STX balance"
              title="STX balance"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--success)] ring-1 ring-[color:var(--success)]/30" aria-hidden />
              {balance === null ? (
                <Skeleton className="h-4 w-16 bg-[var(--surface-2)]" />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {formatStx(balance)} STX
                </span>
              )}
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="h-11 gap-2 rounded-full bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-foreground"
                aria-label="Open wallet menu"
              >
                <Avatar className="h-6 w-6 ring-1 ring-border">
                  <AvatarFallback className="bg-[var(--surface-2)] text-xs font-medium">
                    {address.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium tracking-tight">{addrShort}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-72 bg-[var(--card)] text-foreground"
            >
              <DropdownMenuLabel className="text-muted-foreground">
                Connected Wallet
              </DropdownMenuLabel>
              <div className="px-2 pb-2 pt-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium">{addrShort}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  {balance === null ? (
                    <Skeleton className="h-4 w-20 bg-[var(--surface-2)]" />
                  ) : (
                    <span className="font-medium">{formatStx(balance)} STX</span>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyAddress}>
                {copyOk ? (
                  <Check className="mr-2 h-4 w-4 text-[var(--success)]" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                <span>{copyOk ? "Copied" : "Copy address"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (!address) return;
                  window.open(explorerUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View on Explorer</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleConnect}
            disabled={isConnecting || isLoading}
            variant="default"
            className="h-11 gap-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[color:var(--primary)]/90"
            aria-label="Connect Hiro Wallet"
          >
            {isConnecting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>

          {!window?.StacksProvider && !isConnecting && !isLoading ? (
            <a
              href="https://www.hiro.so/wallet/install-web"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Install Hiro Wallet"
            >
              Install Hiro Wallet
            </a>
          ) : null}
        </div>
      )}

      {error ? (
        <span className="sr-only" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}