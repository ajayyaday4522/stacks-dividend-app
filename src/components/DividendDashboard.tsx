"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Coins,
  Wallet,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Loader2,
  Copy,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type ReactCSSProperties = React.CSSProperties;

export interface DividendPoint {
  date: string | number | Date;
  amount: number;
}

export interface DividendRecord {
  id: string;
  txId: string;
  amount: number;
  timestamp: string | number | Date;
}

export interface DividendDashboardProps {
  className?: string;
  style?: ReactCSSProperties;
  balances?: {
    divBalance: number;
    claimableStx: number;
    totalDividendsReceived: number;
    tokenSupply: number;
  };
  tokenSymbol?: string;
  dividendSymbol?: string;
  tokenDecimals?: number;
  dividendDecimals?: number;
  history?: DividendRecord[];
  chartData?: DividendPoint[];
  onClaim?: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function toDate(d: string | number | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

function formatWithDecimals(value: number, decimals = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function abbreviateMiddle(str: string, head = 6, tail = 6) {
  if (!str) return "";
  if (str.length <= head + tail + 3) return str;
  return `${str.slice(0, head)}...${str.slice(-tail)}`;
}

function useAutoRefresh(
  enabled: boolean | undefined,
  interval: number,
  cb?: () => Promise<void>
) {
  React.useEffect(() => {
    if (!enabled || !cb) return;
    let active = true;
    const id = setInterval(() => {
      if (!active) return;
      cb().catch(() => {
        // Silently ignore auto refresh errors to avoid toast noise
      });
    }, interval);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [enabled, interval, cb]);
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-[var(--surface-1)] p-8 text-center">
      <div className="grid place-items-center rounded-full bg-[var(--surface-2)] p-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentClass = "text-[var(--chart-1)]",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentClass?: string;
}) {
  return (
    <Card className="bg-card shadow-sm transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("rounded-md bg-[var(--surface-2)] p-2", accentClass)} aria-hidden="true">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label ?? "Copy to clipboard"}
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard", { description: abbreviateMiddle(value) });
          setTimeout(() => setCopied(false), 1200);
        } catch {
          toast.error("Copy failed");
        }
      }}
    >
      {copied ? (
        <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

function useContainerSize<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({ width: cr.width, height: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

function LineChart({
  data,
  height = 240,
  stroke = "var(--chart-1)",
  fill = "var(--chart-1)",
}: {
  data: DividendPoint[];
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  const container = useContainerSize<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  const { width } = container.size;

  const padding = { top: 16, right: 12, bottom: 22, left: 28 };

  const { points, minY, maxY, minX, maxX } = React.useMemo(() => {
    const values = data.map((d) => d.amount);
    const times = data.map((d) => toDate(d.date).getTime());
    const minY = Math.min(...values, 0);
    const maxY = Math.max(...values, 1);
    const minX = Math.min(...times, Date.now());
    const maxX = Math.max(...times, Date.now());
    return { points: data.map((d) => ({ x: new Date(d.date).getTime(), y: d.amount })), minY, maxY, minX, maxX };
  }, [data]);

  const innerW = Math.max(0, width - padding.left - padding.right);
  const innerH = Math.max(0, height - padding.top - padding.bottom);

  function xScale(x: number) {
    if (maxX === minX) return padding.left;
    return padding.left + ((x - minX) / (maxX - minX)) * innerW;
  }

  function yScale(y: number) {
    if (maxY === minY) return padding.top + innerH;
    // invert so larger values are higher
    return padding.top + innerH - ((y - minY) / (maxY - minY)) * innerH;
  }

  const pathD = React.useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.x)} ${yScale(p.y)}`)
      .join(" ");
  }, [points, width, height, minX, maxX, minY, maxY]);

  const areaD = React.useMemo(() => {
    if (points.length === 0) return "";
    const start = `M ${xScale(points[0].x)} ${yScale(points[0].y)}`;
    const line = points
      .map((p) => `L ${xScale(p.x)} ${yScale(p.y)}`)
      .join(" ");
    const base = `L ${xScale(points[points.length - 1].x)} ${padding.top + innerH} L ${xScale(points[0].x)} ${
      padding.top + innerH
    } Z`;
    return `${start} ${line} ${base}`;
  }, [points, width, height, minX, maxX, minY, maxY]);

  const ticksY = 4;
  const yTicks = [...Array(ticksY + 1)].map((_, i) => minY + ((maxY - minY) * i) / ticksY);

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    if (points.length === 0) return;
    // find nearest by x
    let nearestIndex = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dx = Math.abs(xScale(points[i].x) - px);
      if (dx < nearestDist) {
        nearestDist = dx;
        nearestIndex = i;
      }
    }
    setHoverIndex(nearestIndex);
  };

  const handlePointerLeave = () => setHoverIndex(null);

  return (
    <div
      ref={container.ref}
      className="relative w-full overflow-hidden rounded-lg border border-border bg-[var(--surface-1)]"
      style={{ height }}
    >
      {data.length === 0 ? (
        <div className="absolute inset-0 grid place-items-center">
          <EmptyState title="No distribution data" description="Distributions will appear here once available." />
        </div>
      ) : null}
      <svg
        role="img"
        aria-label="Dividend distribution trend"
        className="block h-full w-full"
        viewBox={`0 0 ${Math.max(width, 0)} ${height}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Y grid */}
        <g>
          {yTicks.map((t, i) => {
            const y = yScale(t);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  x2={Math.max(width - padding.right, padding.left)}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  opacity={0.5}
                  strokeWidth={1}
                />
                <text
                  x={padding.left - 8}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fill="var(--color-muted-foreground)"
                  fontSize="10"
                >
                  {formatWithDecimals(t, 2)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Area */}
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.22" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaFill)" />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          style={{ filter: "drop-shadow(0 0 12px rgba(46, 211, 183, 0.25))" }}
        />
        {/* Hover indicator */}
        {hoverIndex !== null && points[hoverIndex] ? (
          <>
            <line
              x1={xScale(points[hoverIndex].x)}
              x2={xScale(points[hoverIndex].x)}
              y1={padding.top}
              y2={padding.top + innerH}
              stroke="var(--border)"
              strokeDasharray="4 4"
              opacity={0.8}
            />
            <circle
              cx={xScale(points[hoverIndex].x)}
              cy={yScale(points[hoverIndex].y)}
              r="4"
              fill={stroke}
              stroke="white"
              strokeWidth="1.5"
            />
          </>
        ) : null}
      </svg>
      {hoverIndex !== null && points[hoverIndex] ? (
        <div
          className="pointer-events-none absolute z-10 -translate-y-3 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{
            left: Math.min(
              Math.max(xScale(points[hoverIndex].x), 60),
              Math.max(width - 60, 60)
            ),
            top: 12,
            transform: "translateX(-50%)",
          }}
          role="status"
        >
          <div className="mb-1 font-medium">
            {formatWithDecimals(points[hoverIndex].y, 2)}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            {dateFormatter.format(new Date(points[hoverIndex].x))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DividendDashboard({
  className,
  style,
  balances,
  tokenSymbol = "DIV",
  dividendSymbol = "STX",
  tokenDecimals = 2,
  dividendDecimals = 6,
  history = [],
  chartData = [],
  onClaim,
  onRefresh,
  autoRefresh = true,
  refreshIntervalMs = 15000,
}: DividendDashboardProps) {
  const [isClaiming, setIsClaiming] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const divBalance = balances?.divBalance ?? 0;
  const claimable = balances?.claimableStx ?? 0;
  const totalReceived = balances?.totalDividendsReceived ?? 0;
  const tokenSupply = balances?.tokenSupply ?? 0;

  const canClaim = claimable > 0 && !isClaiming;

  useAutoRefresh(autoRefresh && !!onRefresh, refreshIntervalMs, async () => {
    try {
      setIsRefreshing(true);
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  });

  async function handleClaim() {
    if (!onClaim) {
      toast.error("Cannot claim", {
        description: "No claim handler provided.",
      });
      return;
    }
    try {
      setIsClaiming(true);
      await onClaim();
      toast.success("Dividends claimed", {
        description: `${formatWithDecimals(claimable, dividendDecimals)} ${dividendSymbol} will arrive shortly.`,
      });
    } catch (err) {
      toast.error("Claim failed", {
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsClaiming(false);
    }
  }

  async function handleRefresh() {
    if (!onRefresh) return;
    try {
      setIsRefreshing(true);
      await onRefresh();
      toast.success("Data refreshed");
    } catch (err) {
      toast.error("Refresh failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  const recentHistory = history.slice(0, 8);

  return (
    <section
      className={cn(
        "w-full rounded-xl bg-background",
        className
      )}
      style={style}
      aria-label="Dividend dashboard"
    >
      {/* Header actions */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dividends</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your {tokenSymbol} balance and {dividendSymbol} distributions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            aria-label="Refresh data"
            onClick={handleRefresh}
            disabled={isRefreshing || !onRefresh}
            className="bg-card"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            type="button"
            onClick={handleClaim}
            disabled={!canClaim}
            aria-label="Claim dividends"
            className={cn(
              "bg-primary text-primary-foreground hover:opacity-95",
              !canClaim && "opacity-60"
            )}
          >
            {isClaiming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="mr-2 h-4 w-4" />
            )}
            Claim Dividends
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={`${tokenSymbol} Balance`}
          value={`${formatWithDecimals(divBalance, tokenDecimals)} ${tokenSymbol}`}
          subtitle="Your current token holdings"
          icon={<Coins className="h-4 w-4" />}
          accentClass="text-[var(--chart-1)]"
        />
        <StatCard
          title={`Claimable ${dividendSymbol}`}
          value={`${formatWithDecimals(claimable, dividendDecimals)} ${dividendSymbol}`}
          subtitle="Available to claim"
          icon={<Wallet className="h-4 w-4" />}
          accentClass="text-[var(--chart-2)]"
        />
        <StatCard
          title={`Total ${dividendSymbol} Received`}
          value={`${formatWithDecimals(totalReceived, dividendDecimals)} ${dividendSymbol}`}
          subtitle="All time distributions"
          icon={<TrendingUp className="h-4 w-4" />}
          accentClass="text-[var(--chart-4)]"
        />
        <StatCard
          title="Current Token Supply"
          value={formatWithDecimals(tokenSupply, 0)}
          subtitle="Circulating supply"
          icon={<DollarSign className="h-4 w-4" />}
          accentClass="text-[var(--chart-3)]"
        />
      </div>

      {/* Chart + History */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Distribution Trend</CardTitle>
            <CardDescription className="text-muted-foreground">
              {dividendSymbol} dividends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart data={chartData} height={260} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Distributions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest {dividendSymbol} payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentHistory.length === 0 ? (
              <EmptyState
                title="No recent distributions"
                description="When distributions occur, they’ll be listed here."
              />
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[42%]">Transaction</TableHead>
                      <TableHead className="w-[22%] text-right">Amount</TableHead>
                      <TableHead className="w-[36%]">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentHistory.map((row) => {
                      const date = toDate(row.timestamp);
                      return (
                        <TableRow
                          key={row.id}
                          className="bg-[var(--surface-1)] hover:bg-[var(--surface-2)]/60"
                        >
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">{abbreviateMiddle(row.txId, 10, 8)}</span>
                              <CopyButton value={row.txId} label="Copy transaction id" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatWithDecimals(row.amount, dividendDecimals)} {dividendSymbol}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(date)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}