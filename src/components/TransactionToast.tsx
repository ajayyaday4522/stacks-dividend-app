"use client";

import * as React from "react";
import { Toaster, toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
  Sparkles,
  Flame,
  ArrowLeftRight,
  Gift,
  Wallet,
  Banknote,
  ExternalLink,
  Copy,
} from "lucide-react";

type Network = "mainnet" | "testnet" | "devnet";
type TxState = "submitted" | "pending" | "confirmed" | "failed";
export type TxType = "mint" | "burn" | "transfer" | "claim" | "deposit" | "withdraw";

export interface TransactionToastProps {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  theme?: "dark" | "light" | "system";
  className?: string;
  closeButton?: boolean;
}

interface TxContentProps {
  state: TxState;
  type?: TxType;
  hash?: string;
  network?: Network;
  title?: string;
  message?: string;
}

const txTypeIcon: Record<TxType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  mint: Sparkles,
  burn: Flame,
  transfer: ArrowLeftRight,
  claim: Gift,
  deposit: Wallet,
  withdraw: Banknote,
};

function getStateColor(state: TxState): { bar: string; iconStyle?: React.CSSProperties } {
  switch (state) {
    case "confirmed":
      return { bar: "bg-[color:var(--success)]", iconStyle: { color: "var(--success)" } };
    case "failed":
      return { bar: "bg-[color:var(--danger)]", iconStyle: { color: "var(--danger)" } };
    case "submitted":
    case "pending":
    default:
      return { bar: "bg-[color:var(--primary)]", iconStyle: { color: "var(--primary)" } };
  }
}

function getExplorerUrl(hash?: string, network: Network = "mainnet"): string | undefined {
  if (!hash) return;
  const chain = network === "mainnet" ? "mainnet" : "testnet";
  return `https://explorer.hiro.so/txid/${hash}?chain=${chain}`;
}

function truncateHash(hash?: string, leading = 6, trailing = 6): string {
  if (!hash) return "";
  if (hash.length <= leading + trailing + 3) return hash;
  return `${hash.slice(0, leading)}...${hash.slice(-trailing)}`;
}

function stateTitle(state: TxState, type?: TxType): string {
  const base = type ? `${capitalize(type)} transaction` : "Transaction";
  switch (state) {
    case "submitted":
      return `${base} submitted`;
    case "pending":
      return `${base} pending`;
    case "confirmed":
      return `${base} confirmed`;
    case "failed":
      return `${base} failed`;
    default:
      return base;
  }
}

function defaultMessage(state: TxState): string {
  switch (state) {
    case "submitted":
      return "Your transaction is in the mempool. It will be picked up by miners shortly.";
    case "pending":
      return "Your transaction is being processed. This may take a moment.";
    case "confirmed":
      return "Your transaction was successfully confirmed on-chain.";
    case "failed":
      return "Your transaction did not complete. Please review details and try again.";
    default:
      return "";
  }
}

function capitalize(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function copyToClipboard(text?: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", { duration: 2000 });
  } catch {
    toast.error("Failed to copy", { duration: 2500 });
  }
}

function StateIcon({ state }: { state: TxState }) {
  const { iconStyle } = getStateColor(state);
  if (state === "submitted" || state === "pending") {
    return <Loader2 className="h-4 w-4 animate-spin" style={iconStyle} aria-hidden="true" />;
  }
  if (state === "confirmed") {
    return <CheckCircle2 className="h-4 w-4" style={iconStyle} aria-hidden="true" />;
  }
  return <XCircle className="h-4 w-4" style={iconStyle} aria-hidden="true" />;
}

function TypeIcon({ type }: { type?: TxType }) {
  if (!type) return <Info className="h-4 w-4 text-foreground/80" aria-hidden="true" />;
  const Icon = txTypeIcon[type];
  return <Icon className="h-4 w-4 text-foreground/80" aria-hidden="true" />;
}

function TransactionToastContent({ state, type, hash, network, title, message }: TxContentProps) {
  const link = getExplorerUrl(hash, network);
  const color = getStateColor(state);

  return (
    <div
      className="relative flex w-full items-start gap-3 rounded-lg border border-border bg-secondary p-3"
      role="status"
      aria-live={state === "failed" ? "assertive" : "polite"}
    >
      <span className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${color.bar}`} aria-hidden="true" />
      <div className="mt-0.5">
        <StateIcon state={state} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <TypeIcon type={type} />
          <p className="truncate font-medium text-foreground">{title ?? stateTitle(state, type)}</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{message ?? defaultMessage(state)}</p>

        {hash && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/90">
              {truncateHash(hash)}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(hash)}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-foreground/90 transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Copy transaction hash"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </button>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-foreground/90 transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open in Stacks Explorer"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Explorer
              </a>
            )}
            {state === "pending" && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--primary)]" aria-hidden="true" />
                awaiting confirmation
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type ShowTxBase = {
  type?: TxType;
  hash?: string;
  network?: Network;
  title?: string;
  message?: string;
  duration?: number;
  important?: boolean;
};

export function notifyTxSubmitted(opts: ShowTxBase = {}): string {
  const { type, hash, network, title, message, duration, important } = opts;
  return toast.loading(
    <TransactionToastContent state="submitted" type={type} hash={hash} network={network} title={title} message={message} />,
    {
      duration: typeof duration === "number" ? duration : Infinity,
      important: important ?? true,
      closeButton: true,
    }
  );
}

export function updateTxPending(id: string, opts: ShowTxBase = {}): void {
  const { type, hash, network, title, message, duration, important } = opts;
  toast.update(id, {
    render: <TransactionToastContent state="pending" type={type} hash={hash} network={network} title={title} message={message} />,
    duration: typeof duration === "number" ? duration : Infinity,
    closeButton: true,
    important: important ?? true,
  });
}

export function updateTxConfirmed(id: string, opts: ShowTxBase = {}): void {
  const { type, hash, network, title, message, duration } = opts;
  toast.success(
    <TransactionToastContent state="confirmed" type={type} hash={hash} network={network} title={title} message={message} />,
    {
      id,
      duration: typeof duration === "number" ? duration : 6000,
      closeButton: true,
      important: false,
    }
  );
}

export function updateTxFailed(id: string, opts: ShowTxBase & { error?: string } = {}): void {
  const { type, hash, network, title, message, duration } = opts;
  toast.error(
    <TransactionToastContent state="failed" type={type} hash={hash} network={network} title={title} message={message ?? opts.error} />,
    {
      id,
      duration: typeof duration === "number" ? duration : 8000,
      closeButton: true,
      important: true,
    }
  );
}

// Convenience helpers for one-off toasts
export function notifySuccess(message: string, opts?: { description?: string; duration?: number }) {
  toast.success(
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4" style={{ color: "var(--success)" }} aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{message}</p>
        {opts?.description && <p className="mt-0.5 text-sm text-muted-foreground">{opts.description}</p>}
      </div>
    </div>,
    { duration: opts?.duration ?? 5000, closeButton: true }
  );
}

export function notifyError(message: string, opts?: { description?: string; duration?: number }) {
  toast.error(
    <div className="flex items-start gap-3">
      <XCircle className="mt-0.5 h-4 w-4" style={{ color: "var(--danger)" }} aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{message}</p>
        {opts?.description && <p className="mt-0.5 text-sm text-muted-foreground">{opts.description}</p>}
      </div>
    </div>,
    { duration: opts?.duration ?? 8000, closeButton: true, important: true }
  );
}

export function notifyInfo(message: string, opts?: { description?: string; duration?: number }) {
  toast.message(
    <div className="flex items-start gap-3">
      <Info className="mt-0.5 h-4 w-4 text-foreground/80" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{message}</p>
        {opts?.description && <p className="mt-0.5 text-sm text-muted-foreground">{opts.description}</p>}
      </div>
    </div>,
    { duration: opts?.duration ?? 5000, closeButton: true }
  );
}

export function notifyWarning(message: string, opts?: { description?: string; duration?: number }) {
  toast.warning(
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-4 w-4" style={{ color: "var(--warning)" }} aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{message}</p>
        {opts?.description && <p className="mt-0.5 text-sm text-muted-foreground">{opts.description}</p>}
      </div>
    </div>,
    { duration: opts?.duration ?? 7000, closeButton: true }
  );
}

// A small orchestrator to easily manage a transaction toast lifecycle
export function beginTransaction(opts: ShowTxBase = {}) {
  const id = notifyTxSubmitted(opts);
  return {
    id,
    toPending: (next?: ShowTxBase) => updateTxPending(id, { ...opts, ...next }),
    toConfirmed: (next?: ShowTxBase) => updateTxConfirmed(id, { ...opts, ...next }),
    toFailed: (next?: ShowTxBase & { error?: string }) => updateTxFailed(id, { ...opts, ...next }),
  };
}

export default function TransactionToast({
  position = "top-right",
  theme = "dark",
  className,
  closeButton = true,
}: TransactionToastProps) {
  return (
    <Toaster
      theme={theme}
      position={position}
      closeButton={closeButton}
      richColors={false}
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "group relative w-full sm:w-[420px] rounded-lg border border-border bg-secondary text-foreground shadow-xl ring-0 backdrop-blur supports-[backdrop-filter]:bg-secondary",
          description: "text-sm text-muted-foreground",
          actionButton:
            "inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          cancelButton:
            "inline-flex items-center justify-center whitespace-nowrap rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground shadow transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          closeButton:
            "rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        },
        className,
      }}
    />
  );
}