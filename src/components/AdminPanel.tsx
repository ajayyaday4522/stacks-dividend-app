"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  Coins,
  Banknote,
  Pause,
  Play,
  History,
  Loader2,
  Send,
  Plus,
  Minus,
  AlertTriangle,
  RefreshCcw,
  Wallet,
} from "lucide-react";

type AdminActionType = "deposit" | "mint" | "burn" | "pause" | "unpause";

type AdminAction = {
  id: string;
  type: AdminActionType;
  amount?: number;
  recipient?: string;
  txId?: string;
  status: "pending" | "success" | "error";
  timestamp: number;
  note?: string;
};

type ContractStatus = {
  paused: boolean;
  totalSupply?: string | number;
  contractAddress?: string;
  network?: string;
  lastDividendAt?: string | number | Date;
  ownerAddress?: string;
};

interface TxResult {
  txId: string;
  success: boolean;
}

interface AdminPanelProps {
  isOwner: boolean;
  status?: ContractStatus;
  initialHistory?: AdminAction[];
  onDeposit?: (amount: number) => Promise<TxResult>;
  onMint?: (recipient: string, amount: number) => Promise<TxResult>;
  onBurn?: (recipient: string, amount: number) => Promise<TxResult>;
  onPause?: () => Promise<TxResult>;
  onUnpause?: () => Promise<TxResult>;
  fetchStatus?: () => Promise<ContractStatus | undefined>;
  pollingIntervalMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

const amountSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(Number(v)), "Amount must be a number")
    .transform((v) => Number(v))
    .refine((v) => v > 0, "Amount must be greater than 0"),
});

const mintSchema = z.object({
  recipient: z.string().min(5, "Recipient is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(Number(v)), "Amount must be a number")
    .transform((v) => Number(v))
    .refine((v) => v > 0, "Amount must be greater than 0"),
});

const burnSchema = mintSchema;

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(n?: number | string) {
  if (n === undefined || n === null) return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return String(n);
  return Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(num);
}

function shortHash(h?: string) {
  if (!h) return "—";
  if (h.length <= 12) return h;
  return `${h.slice(0, 6)}…${h.slice(-4)}`;
}

function toDate(input?: string | number | Date) {
  if (!input) return undefined;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default function AdminPanel({
  isOwner,
  status,
  initialHistory = [],
  onDeposit,
  onMint,
  onBurn,
  onPause,
  onUnpause,
  fetchStatus,
  pollingIntervalMs = 15000,
  className,
  style,
}: AdminPanelProps) {
  const [liveStatus, setLiveStatus] = React.useState<ContractStatus | undefined>(status);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [history, setHistory] = React.useState<AdminAction[]>(initialHistory);
  const [confirmDepositOpen, setConfirmDepositOpen] = React.useState(false);
  const [confirmMintOpen, setConfirmMintOpen] = React.useState(false);
  const [confirmBurnOpen, setConfirmBurnOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<AdminActionType | null>(null);

  const depositForm = useForm<z.infer<typeof amountSchema>>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: "" as unknown as number },
    mode: "onTouched",
  });

  const mintForm = useForm<z.infer<typeof mintSchema>>({
    resolver: zodResolver(mintSchema),
    defaultValues: { recipient: "", amount: "" as unknown as number },
    mode: "onTouched",
  });

  const burnForm = useForm<z.infer<typeof burnSchema>>({
    resolver: zodResolver(burnSchema),
    defaultValues: { recipient: "", amount: "" as unknown as number },
    mode: "onTouched",
  });

  const paused = liveStatus?.paused ?? status?.paused ?? false;

  React.useEffect(() => {
    if (!fetchStatus || !isOwner) return;
    let mounted = true;
    let id: any;

    const run = async () => {
      try {
        setIsRefreshing(true);
        const s = await fetchStatus();
        if (mounted && s) setLiveStatus(s);
      } catch (e) {
        // ignore polling errors, surface manual refresh errors only
      } finally {
        if (mounted) setIsRefreshing(false);
      }
    };

    run();
    id = setInterval(run, pollingIntervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [fetchStatus, pollingIntervalMs, isOwner]);

  const addHistory = React.useCallback((action: AdminAction) => {
    setHistory((h) => [action, ...h].slice(0, 200));
  }, []);

  const updateHistory = React.useCallback((id: string, patch: Partial<AdminAction>) => {
    setHistory((h) => h.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const handleManualRefresh = async () => {
    if (!fetchStatus) return;
    try {
      setIsRefreshing(true);
      const s = await fetchStatus();
      if (s) setLiveStatus(s);
      toast.success("Status refreshed");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to refresh status";
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOwner) {
    return (
      <Card className={cn("bg-card text-foreground shadow-sm", className)} style={style} aria-live="polite">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-[var(--warning)]" aria-hidden />
            Admin Access Required
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            This panel is restricted to the contract owner. Connect with the owner wallet to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 rounded-md bg-[var(--surface-2)] px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-[var(--warning)]" aria-hidden />
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, verify your wallet account and network.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-card p-4 sm:p-6 text-foreground shadow-sm ring-1 ring-border",
        className
      )}
      style={style}
      aria-live="polite"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "inline-flex h-2.5 w-2.5 flex-none rounded-full ring-2 ring-offset-0",
              paused ? "bg-[var(--warning)] ring-[var(--warning)]" : "bg-[var(--success)] ring-[var(--success)]"
            )}
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-semibold tracking-tight">
              Contract {paused ? "Paused" : "Active"}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {liveStatus?.network ? `${liveStatus.network} • ` : ""}
              {liveStatus?.contractAddress ? shortHash(liveStatus.contractAddress) : "Contract"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={!fetchStatus || isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover">
                <p>Fetch latest contract status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[var(--surface-2)]">
          <TabsTrigger value="actions" className="data-[state=active]:bg-secondary">
            Actions
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-secondary">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="mt-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Banknote className="h-5 w-5 text-[var(--chart-1)]" />
                  Deposit STX Dividends
                </CardTitle>
                <CardDescription>Distribute STX to token holders.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={depositForm.handleSubmit(() => setConfirmDepositOpen(true))}
                >
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Amount (STX)</Label>
                    <div className="relative">
                      <Input
                        id="deposit-amount"
                        inputMode="decimal"
                        placeholder="0.00"
                        {...depositForm.register("amount")}
                        aria-invalid={!!depositForm.formState.errors.amount}
                        className="pr-14"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-xs text-muted-foreground">
                        STX
                      </span>
                    </div>
                    {depositForm.formState.errors.amount && (
                      <p className="text-xs text-[var(--danger)]">
                        {depositForm.formState.errors.amount.message as string}
                      </p>
                    )}
                  </div>

                  <Dialog open={confirmDepositOpen} onOpenChange={setConfirmDepositOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!onDeposit || paused || depositForm.formState.isSubmitting}
                      >
                        {depositForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Deposit
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-popover">
                      <DialogHeader>
                        <DialogTitle>Confirm Dividend Deposit</DialogTitle>
                        <DialogDescription>
                          You are about to deposit STX dividends to the contract.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="rounded-md bg-[var(--surface-2)] p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">
                            {formatNumber(depositForm.getValues("amount"))} STX
                          </span>
                        </div>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="button"
                          onClick={async () => {
                            const parsed = amountSchema.safeParse({
                              amount: String(depositForm.getValues("amount") ?? ""),
                            });
                            if (!parsed.success) {
                              toast.error(parsed.error.errors[0]?.message ?? "Invalid amount");
                              return;
                            }
                            const amt = parsed.data.amount;
                            setPendingAction("deposit");
                            const id = crypto.randomUUID();
                            addHistory({
                              id,
                              type: "deposit",
                              amount: amt,
                              status: "pending",
                              timestamp: Date.now(),
                            });
                            try {
                              if (!onDeposit) {
                                throw new Error("Deposit handler not configured");
                              }
                              const res = await onDeposit(amt);
                              updateHistory(id, {
                                status: res.success ? "success" : "error",
                                txId: res.txId,
                              });
                              if (res.success) {
                                toast.success("Dividend deposit confirmed");
                                depositForm.reset();
                              } else {
                                toast.error("Dividend deposit failed");
                              }
                            } catch (e) {
                              const message = e instanceof Error ? e.message : "Deposit failed";
                              updateHistory(id, { status: "error", note: message });
                              toast.error(message);
                            } finally {
                              setPendingAction(null);
                              setConfirmDepositOpen(false);
                            }
                          }}
                          disabled={pendingAction === "deposit"}
                        >
                          {pendingAction === "deposit" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            "Confirm Deposit"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {paused && (
                    <div className="flex items-start gap-2 rounded-md bg-[color:color-mix(in_oklab,var(--warning),transparent_85%)] p-3">
                      <Pause className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
                      <p className="text-xs text-muted-foreground">
                        The contract is currently paused. Deposits are disabled.
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-[var(--chart-2)]" />
                  Mint Tokens
                </CardTitle>
                <CardDescription>Issue new tokens to a recipient address.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={mintForm.handleSubmit(() => setConfirmMintOpen(true))}
                >
                  <div className="space-y-2">
                    <Label htmlFor="mint-recipient">Recipient Address</Label>
                    <Input
                      id="mint-recipient"
                      placeholder="SP... or address"
                      {...mintForm.register("recipient")}
                      aria-invalid={!!mintForm.formState.errors.recipient}
                    />
                    {mintForm.formState.errors.recipient && (
                      <p className="text-xs text-[var(--danger)]">
                        {mintForm.formState.errors.recipient.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mint-amount">Amount</Label>
                    <Input
                      id="mint-amount"
                      inputMode="decimal"
                      placeholder="0"
                      {...mintForm.register("amount")}
                      aria-invalid={!!mintForm.formState.errors.amount}
                    />
                    {mintForm.formState.errors.amount && (
                      <p className="text-xs text-[var(--danger)]">
                        {mintForm.formState.errors.amount.message as string}
                      </p>
                    )}
                  </div>

                  <Dialog open={confirmMintOpen} onOpenChange={setConfirmMintOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!onMint || paused || mintForm.formState.isSubmitting}
                      >
                        {mintForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Mint
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-popover">
                      <DialogHeader>
                        <DialogTitle>Confirm Mint</DialogTitle>
                        <DialogDescription>
                          Review the mint details before submitting the transaction.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 rounded-md bg-[var(--surface-2)] p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Recipient</span>
                          <span className="font-medium">{mintForm.getValues("recipient") || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">{formatNumber(mintForm.getValues("amount"))}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-md bg-[color:color-mix(in_oklab,var(--warning),transparent_85%)] p-3">
                        <ShieldAlert className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
                        <p className="text-xs text-muted-foreground">
                          Be sure the recipient address is correct. Minting increases the total supply.
                        </p>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="button"
                          onClick={async () => {
                            const parsed = mintSchema.safeParse({
                              recipient: mintForm.getValues("recipient"),
                              amount: String(mintForm.getValues("amount") ?? ""),
                            });
                            if (!parsed.success) {
                              const err = parsed.error.errors[0]?.message ?? "Invalid input";
                              toast.error(err);
                              return;
                            }
                            const { recipient, amount } = parsed.data;
                            setPendingAction("mint");
                            const id = crypto.randomUUID();
                            addHistory({
                              id,
                              type: "mint",
                              recipient,
                              amount,
                              status: "pending",
                              timestamp: Date.now(),
                            });
                            try {
                              if (!onMint) throw new Error("Mint handler not configured");
                              const res = await onMint(recipient, amount);
                              updateHistory(id, {
                                status: res.success ? "success" : "error",
                                txId: res.txId,
                              });
                              if (res.success) {
                                toast.success("Mint transaction confirmed");
                                mintForm.reset();
                              } else {
                                toast.error("Mint transaction failed");
                              }
                            } catch (e) {
                              const message = e instanceof Error ? e.message : "Mint failed";
                              updateHistory(id, { status: "error", note: message });
                              toast.error(message);
                            } finally {
                              setPendingAction(null);
                              setConfirmMintOpen(false);
                            }
                          }}
                          disabled={pendingAction === "mint"}
                        >
                          {pendingAction === "mint" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            "Confirm Mint"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {paused && (
                    <div className="flex items-start gap-2 rounded-md bg-[color:color-mix(in_oklab,var(--warning),transparent_85%)] p-3">
                      <Pause className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
                      <p className="text-xs text-muted-foreground">
                        Contract paused. Minting is disabled.
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Minus className="h-5 w-5 text-[var(--danger)]" />
                Burn Tokens
              </CardTitle>
              <CardDescription>Remove tokens from circulation.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={burnForm.handleSubmit(() => setConfirmBurnOpen(true))}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="burn-recipient">Holder Address</Label>
                    <Input
                      id="burn-recipient"
                      placeholder="SP... or address"
                      {...burnForm.register("recipient")}
                      aria-invalid={!!burnForm.formState.errors.recipient}
                    />
                    {burnForm.formState.errors.recipient && (
                      <p className="text-xs text-[var(--danger)]">
                        {burnForm.formState.errors.recipient.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="burn-amount">Amount</Label>
                    <Input
                      id="burn-amount"
                      inputMode="decimal"
                      placeholder="0"
                      {...burnForm.register("amount")}
                      aria-invalid={!!burnForm.formState.errors.amount}
                    />
                    {burnForm.formState.errors.amount && (
                      <p className="text-xs text-[var(--danger)]">
                        {burnForm.formState.errors.amount.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <AlertDialog open={confirmBurnOpen} onOpenChange={setConfirmBurnOpen}>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    disabled={!onBurn || paused || burnForm.formState.isSubmitting}
                  >
                    {burnForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Minus className="mr-2 h-4 w-4" />
                        Burn
                      </>
                    )}
                  </Button>
                  <AlertDialogContent className="bg-popover">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Burn</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is destructive and cannot be undone. Tokens will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 rounded-md bg-[var(--surface-2)] p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Holder</span>
                        <span className="font-medium">{burnForm.getValues("recipient") || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">{formatNumber(burnForm.getValues("amount"))}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-[color:color-mix(in_oklab,var(--danger),transparent_85%)] p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--danger)]" />
                      <p className="text-xs text-muted-foreground">
                        Ensure the holder has sufficient balance and the amount is correct.
                      </p>
                    </div>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel asChild>
                        <Button variant="outline">Cancel</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction
                        asChild
                      >
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            const parsed = burnSchema.safeParse({
                              recipient: burnForm.getValues("recipient"),
                              amount: String(burnForm.getValues("amount") ?? ""),
                            });
                            if (!parsed.success) {
                              toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
                              return;
                            }
                            const { recipient, amount } = parsed.data;
                            setPendingAction("burn");
                            const id = crypto.randomUUID();
                            addHistory({
                              id,
                              type: "burn",
                              recipient,
                              amount,
                              status: "pending",
                              timestamp: Date.now(),
                            });
                            try {
                              if (!onBurn) throw new Error("Burn handler not configured");
                              const res = await onBurn(recipient, amount);
                              updateHistory(id, {
                                status: res.success ? "success" : "error",
                                txId: res.txId,
                              });
                              if (res.success) {
                                toast.success("Burn transaction confirmed");
                                burnForm.reset();
                              } else {
                                toast.error("Burn transaction failed");
                              }
                            } catch (e) {
                              const message = e instanceof Error ? e.message : "Burn failed";
                              updateHistory(id, { status: "error", note: message });
                              toast.error(message);
                            } finally {
                              setPendingAction(null);
                              setConfirmBurnOpen(false);
                            }
                          }}
                          disabled={pendingAction === "burn"}
                        >
                          {pendingAction === "burn" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            "Confirm Burn"
                          )}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {paused && (
                  <div className="flex items-start gap-2 rounded-md bg-[color:color-mix(in_oklab,var(--warning),transparent_85%)] p-3">
                    <Pause className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
                    <p className="text-xs text-muted-foreground">
                      Contract paused. Burning is disabled.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {paused ? (
                  <Pause className="h-5 w-5 text-[var(--warning)]" />
                ) : (
                  <Play className="h-5 w-5 text-[var(--success)]" />
                )}
                Contract Controls
              </CardTitle>
              <CardDescription>Pause or resume the contract with confirmations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid items-start gap-4 sm:grid-cols-3">
                <div className="rounded-md bg-[var(--surface-2)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={paused ? "destructive" : "secondary"}>
                      {paused ? "Paused" : "Active"}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-md bg-[var(--surface-2)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Supply</span>
                    <span className="font-medium">
                      {formatNumber(liveStatus?.totalSupply)}
                    </span>
                  </div>
                </div>
                <div className="rounded-md bg-[var(--surface-2)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Dividend</span>
                    <span className="font-medium">
                      {toDate(liveStatus?.lastDividendAt)
                        ? toDate(liveStatus?.lastDividendAt)!.toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Owner: {shortHash(liveStatus?.ownerAddress)}
                </div>

                {!paused ? (
                  <AlertDialog>
                    <AlertDialogContent className="bg-popover">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Pause Contract?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Pausing will disable minting, burning, and deposits until resumed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex items-start gap-2 rounded-md bg-[color:color-mix(in_oklab,var(--warning),transparent_85%)] p-3">
                        <ShieldAlert className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
                        <p className="text-xs text-muted-foreground">
                          This is a protective action. You can unpause later.
                        </p>
                      </div>
                      <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel asChild>
                          <Button variant="outline">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant="secondary"
                            onClick={async () => {
                              setPendingAction("pause");
                              const id = crypto.randomUUID();
                              addHistory({
                                id,
                                type: "pause",
                                status: "pending",
                                timestamp: Date.now(),
                              });
                              try {
                                if (!onPause) throw new Error("Pause handler not configured");
                                const res = await onPause();
                                updateHistory(id, {
                                  status: res.success ? "success" : "error",
                                  txId: res.txId,
                                });
                                if (res.success) {
                                  toast.success("Contract paused");
                                  setLiveStatus((s) => ({ ...(s ?? { paused: true }), paused: true }));
                                } else {
                                  toast.error("Pause transaction failed");
                                }
                              } catch (e) {
                                const message = e instanceof Error ? e.message : "Pause failed";
                                updateHistory(id, { status: "error", note: message });
                                toast.error(message);
                              } finally {
                                setPendingAction(null);
                              }
                            }}
                            disabled={pendingAction === "pause"}
                          >
                            {pendingAction === "pause" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Pausing...
                              </>
                            ) : (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Contract
                              </>
                            )}
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                    <Button asChild variant="secondary">
                      <div role="button" className="inline-flex items-center">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </div>
                    </Button>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogContent className="bg-popover">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unpause Contract?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Resuming will re-enable minting, burning, and deposits.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex items-start gap-2 rounded-md bg-[color:color-mix(in_oklab,var(--success),transparent_85%)] p-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                        <p className="text-xs text-muted-foreground">
                          Ensure the contract is safe to resume.
                        </p>
                      </div>
                      <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel asChild>
                          <Button variant="outline">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            onClick={async () => {
                              setPendingAction("unpause");
                              const id = crypto.randomUUID();
                              addHistory({
                                id,
                                type: "unpause",
                                status: "pending",
                                timestamp: Date.now(),
                              });
                              try {
                                if (!onUnpause) throw new Error("Unpause handler not configured");
                                const res = await onUnpause();
                                updateHistory(id, {
                                  status: res.success ? "success" : "error",
                                  txId: res.txId,
                                });
                                if (res.success) {
                                  toast.success("Contract resumed");
                                  setLiveStatus((s) => ({ ...(s ?? { paused: false }), paused: false }));
                                } else {
                                  toast.error("Unpause transaction failed");
                                }
                              } catch (e) {
                                const message = e instanceof Error ? e.message : "Unpause failed";
                                updateHistory(id, { status: "error", note: message });
                                toast.error(message);
                              } finally {
                                setPendingAction(null);
                              }
                            }}
                            disabled={pendingAction === "unpause"}
                          >
                            {pendingAction === "unpause" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resuming...
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Unpause Contract
                              </>
                            )}
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                    <Button asChild>
                      <div role="button" className="inline-flex items-center">
                        <Play className="mr-2 h-4 w-4" />
                        Unpause
                      </div>
                    </Button>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-card">
            <CardHeader className="flex items-center justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5 text-[var(--chart-4)]" />
                  Admin Actions
                </CardTitle>
                <CardDescription>Recent administrative activity.</CardDescription>
              </div>
              <Badge variant="secondary">{history.length} records</Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-md ring-1 ring-border">
                <ScrollArea className="max-h-[360px]">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-[var(--surface-2)]">
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tx</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                            No admin actions yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        history.map((item) => (
                          <TableRow key={item.id} className="hover:bg-[var(--surface-2)] transition-colors">
                            <TableCell className="capitalize">
                              <div className="flex items-center gap-2">
                                {iconForAction(item.type)}
                                {item.type}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.type === "deposit" && (
                                <span>{formatNumber(item.amount)} STX</span>
                              )}
                              {(item.type === "mint" || item.type === "burn") && (
                                <div className="flex flex-col">
                                  <span>
                                    {formatNumber(item.amount)} tokens
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    to {shortHash(item.recipient)}
                                  </span>
                                </div>
                              )}
                              {(item.type === "pause" || item.type === "unpause") && (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "success"
                                    ? "secondary"
                                    : item.status === "pending"
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.txId ? (
                                <code className="rounded bg-[var(--surface-2)] px-2 py-1 text-xs">
                                  {shortHash(item.txId)}
                                </code>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function iconForAction(type: AdminActionType) {
  const className = "h-4 w-4 text-muted-foreground";
  switch (type) {
    case "deposit":
      return <Banknote className={className} />;
    case "mint":
      return <Plus className={className} />;
    case "burn":
      return <Minus className={className} />;
    case "pause":
      return <Pause className={className} />;
    case "unpause":
      return <Play className={className} />;
    default:
      return null;
  }
}