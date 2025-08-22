"use client"

import * as React from "react"
import { toast } from "sonner"
import { Copy, Check, Search, ArrowUpDown, ArrowDown, ArrowUp, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type TokenHolder = {
  address: string
  balance: number
}

type SortOrder = "asc" | "desc"

interface TokenHoldersTableProps {
  holders: TokenHolder[]
  totalSupply: number
  dividendPool?: number
  tokenSymbol?: string
  dividendSymbol?: string
  pageSize?: number
  isLoading?: boolean
  initialSort?: SortOrder
  locale?: string
  searchPlaceholder?: string
  className?: string
  style?: React.CSSProperties
  formatBalance?: (n: number) => string
  formatPercentage?: (n: number) => string
  formatEntitlement?: (n: number) => string
}

export default function TokenHoldersTable({
  holders,
  totalSupply,
  dividendPool,
  tokenSymbol = "DIV",
  dividendSymbol,
  pageSize: defaultPageSize = 25,
  isLoading = false,
  initialSort = "desc",
  locale = "en-US",
  searchPlaceholder = "Search by address…",
  className,
  style,
  formatBalance,
  formatPercentage,
  formatEntitlement,
}: TokenHoldersTableProps) {
  const [query, setQuery] = React.useState("")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(initialSort)
  const [pageSize, setPageSize] = React.useState<number>(defaultPageSize)
  const [page, setPage] = React.useState<number>(1)
  const [copied, setCopied] = React.useState<string | null>(null)

  const nfBalance =
    formatBalance ||
    ((n: number) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(n))
  const nfPercent =
    formatPercentage ||
    ((n: number) =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 2,
      }).format(n))
  const nfEntitlement =
    formatEntitlement ||
    ((n: number) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(n))

  const dividendLabel = dividendSymbol || tokenSymbol

  React.useEffect(() => {
    setPage(1)
  }, [query, pageSize])

  const filteredSorted = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? holders.filter((h) => h.address.toLowerCase().includes(q))
      : holders.slice()

    filtered.sort((a, b) => {
      const d = a.balance - b.balance
      return sortOrder === "asc" ? d : -d
    })

    return filtered
  }, [holders, query, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize))
  const clampedPage = Math.min(Math.max(1, page), totalPages)
  React.useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  const startIndex = (clampedPage - 1) * pageSize
  const pageItems = filteredSorted.slice(startIndex, startIndex + pageSize)

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(address)
      toast.success("Address copied")
      window.setTimeout(() => setCopied(null), 1200)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const toggleSort = () => {
    setSortOrder((s) => (s === "asc" ? "desc" : "asc"))
  }

  const percentOfSupply = (balance: number) => {
    if (!totalSupply || totalSupply <= 0) return 0
    return balance / totalSupply
  }

  const entitlementFor = (balance: number) => {
    if (!dividendPool || !totalSupply || totalSupply <= 0) return undefined
    return (balance / totalSupply) * dividendPool
  }

  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`
  }

  const LoadingSkeletonRows = ({ rows = 8 }: { rows?: number }) => (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr
          key={`sk-${i}`}
          className="border-b border-border/60 last:border-0 hover:bg-surface-1/40"
        >
          <td className="py-4 pl-4 pr-2 text-muted-foreground">
            <div className="h-4 w-6 rounded bg-muted/40 animate-pulse" />
          </td>
          <td className="py-4 px-2">
            <div className="h-4 w-40 rounded bg-muted/40 animate-pulse" />
          </td>
          <td className="py-4 px-2">
            <div className="h-4 w-24 rounded bg-muted/40 animate-pulse" />
          </td>
          <td className="py-4 px-2">
            <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
          </td>
          <td className="py-4 px-2">
            <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
          </td>
        </tr>
      ))}
    </tbody>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-surface-1 p-3 text-muted-foreground">
        <Wallet className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No holders found</p>
        <p className="text-sm text-muted-foreground">
          {query
            ? "Try adjusting your search."
            : "Once addresses hold tokens, they will appear here."}
        </p>
      </div>
    </div>
  )

  return (
    <Card
      className={cn(
        "bg-card border border-border/80 rounded-xl shadow-sm",
        "overflow-hidden",
        className
      )}
      style={style}
      role="region"
      aria-label={`${tokenSymbol} holders leaderboard`}
    >
      <CardHeader className="gap-2 border-b border-border/60 bg-surface-2/30">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
              {tokenSymbol} Holders Leaderboard
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Ranked by balance. Copy addresses, filter, and sort.
            </CardDescription>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total holders:</span>
            <span className="font-medium text-foreground">{holders.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search holders by address"
              className="pl-9 bg-surface-1 border-input focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleSort}
                    className="bg-surface-1 border border-border/70 hover:bg-surface-2"
                    aria-label={`Sort by balance ${sortOrder === "asc" ? "descending" : "ascending"}`}
                  >
                    {sortOrder === "asc" ? (
                      <ArrowUp className="mr-2 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-2 h-4 w-4" />
                    )}
                    Balance
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Toggle balance sort</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger
                  className="w-[84px] bg-surface-1 border-border/70"
                  aria-label="Rows per page"
                >
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Mobile list */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="px-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`msk-${i}`}
                  className="border-b border-border/60 last:border-0 px-1 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-10 rounded bg-muted/40 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-muted/40 animate-pulse" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="h-4 w-24 rounded bg-muted/40 animate-pulse" />
                    <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-border/60">
              {pageItems.map((h, idx) => {
                const rank = startIndex + idx + 1
                const pct = percentOfSupply(h.balance)
                const ent = entitlementFor(h.balance)
                return (
                  <li
                    key={h.address}
                    className="px-4 py-4 hover:bg-surface-1/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">#{rank}</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="group inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => handleCopy(h.address)}
                          aria-label={`Copy address ${h.address}`}
                          title={h.address}
                        >
                          <span className="font-medium">{truncateAddress(h.address)}</span>
                          {copied === h.address ? (
                            <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="font-medium">
                          {nfBalance(h.balance)} {tokenSymbol}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-xs text-muted-foreground">% of Supply</p>
                        <p className="font-medium">{nfPercent(pct)}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">Est. Dividend</p>
                      <p className="font-medium">
                        {ent === undefined ? "—" : `${nfEntitlement(ent)} ${dividendLabel}`}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableCaption className="sr-only">Ranked list of token holders</TableCaption>
            <TableHeader className="bg-surface-2/40">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-[64px] pl-4">Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="min-w-[180px]">
                  <button
                    onClick={toggleSort}
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
                    aria-label={`Sort by balance ${sortOrder === "asc" ? "descending" : "ascending"}`}
                  >
                    Balance
                    {sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="min-w-[140px]">% of Supply</TableHead>
                <TableHead className="min-w-[200px]">
                  <div className="inline-flex items-center gap-1">
                    Est. Dividend
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-surface-1 text-[10px] text-muted-foreground"
                            aria-label="Estimated based on current dividend pool and holder share"
                          >
                            i
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-sm leading-relaxed">
                          Estimated entitlement calculated as:
                          {" "}
                          holder balance ÷ total supply × dividend pool.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            {isLoading ? (
              <LoadingSkeletonRows rows={Math.min(10, defaultPageSize)} />
            ) : pageItems.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <EmptyState />
                  </td>
                </tr>
              </tbody>
            ) : (
              <TableBody>
                {pageItems.map((h, idx) => {
                  const rank = startIndex + idx + 1
                  const pct = percentOfSupply(h.balance)
                  const ent = entitlementFor(h.balance)
                  return (
                    <TableRow
                      key={h.address}
                      className="border-b border-border/60 last:border-0 hover:bg-surface-1/40 transition-colors"
                    >
                      <TableCell className="pl-4 font-medium text-muted-foreground">
                        #{rank}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="group inline-flex max-w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => handleCopy(h.address)}
                            aria-label={`Copy address ${h.address}`}
                            title={h.address}
                          >
                            <span className="truncate">
                              {truncateAddress(h.address)}
                            </span>
                            {copied === h.address ? (
                              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                            ) : (
                              <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {nfBalance(h.balance)} {tokenSymbol}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{nfPercent(pct)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {ent === undefined ? "—" : `${nfEntitlement(ent)} ${dividendLabel}`}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            )}
          </Table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col gap-3 border-t border-border/60 bg-surface-2/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing{" "}
              <span className="text-foreground font-medium">
                {pageItems.length === 0 ? 0 : startIndex + 1}
              </span>
              {" – "}
              <span className="text-foreground font-medium">
                {startIndex + pageItems.length}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-medium">
                {filteredSorted.length}
              </span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Page {clampedPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="sm:hidden">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger
                  className="w-[84px] bg-surface-1 border-border/70"
                  aria-label="Rows per page"
                >
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={clampedPage <= 1 || isLoading}
              className="bg-surface-1 border border-border/70 hover:bg-surface-2"
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={clampedPage >= totalPages || isLoading}
              className="bg-surface-1 border border-border/70 hover:bg-surface-2"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}