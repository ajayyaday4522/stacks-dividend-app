"use client";

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CircleDollarSign } from 'lucide-react';

// Types
export interface DividendRecord {
  date: string | Date;
  amount: number;
}

export type Range = "7d" | "30d" | "90d" | "all";
export type ViewMode = "cumulative" | "individual";

export interface DividendChartProps {
  data: DividendRecord[];
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  height?: number;
  defaultRange?: Range;
  defaultView?: ViewMode;
  currency?: string;
  locale?: string;
  onPointClick?: (data: any) => void;
  title?: string;
  description?: string;
}

// Utility functions
const formatDate = (date: Date, locale = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getDateRange = (range: Range): Date => {
  const now = new Date();
  const days = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "all": 365 * 10, // 10 years for "all"
  };
  
  return new Date(now.getTime() - days[range] * 24 * 60 * 60 * 1000);
};

const processData = (
  data: DividendRecord[],
  range: Range,
  viewMode: ViewMode
) => {
  if (!data || data.length === 0) return [];

  const rangeDate = getDateRange(range);
  
  // Convert dates and filter by range
  const filteredData = data
    .map(record => ({
      ...record,
      date: new Date(record.date)
    }))
    .filter(record => record.date >= rangeDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by day
  const groupedData = new Map<string, number>();
  
  filteredData.forEach(record => {
    const dayKey = record.date.toISOString().split('T')[0];
    groupedData.set(dayKey, (groupedData.get(dayKey) || 0) + record.amount);
  });

  // Convert to array and calculate cumulative if needed
  const processedData = Array.from(groupedData.entries()).map(([dateStr, amount]) => {
    return {
      date: new Date(dateStr),
      amount,
    };
  });

  if (viewMode === 'cumulative') {
    let cumulative = 0;
    return processedData.map(item => ({
      ...item,
      amount: cumulative += item.amount,
    }));
  }

  return processedData;
};

// Components
const LoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="w-full space-y-4" style={{ height }}>
    <div className="flex justify-between">
      <div className="h-4 w-32 bg-surface-1 rounded animate-pulse" />
      <div className="flex space-x-2">
        <div className="h-8 w-24 bg-surface-1 rounded animate-pulse" />
        <div className="h-8 w-32 bg-surface-1 rounded animate-pulse" />
      </div>
    </div>
    <div className="relative" style={{ height: height - 60 }}>
      <div className="absolute inset-0 bg-surface-1 rounded animate-pulse" />
    </div>
  </div>
);

const SegmentedControl: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}> = ({ options, value, onChange, ariaLabel }) => (
  <div 
    className="inline-flex bg-surface-1 rounded-lg p-1"
    role="radiogroup"
    aria-label={ariaLabel}
  >
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`
          px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
          ${value === option.value
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
          }
        `}
        role="radio"
        aria-checked={value === option.value}
        tabIndex={value === option.value ? 0 : -1}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
    <CircleDollarSign className="h-12 w-12 mb-4 opacity-50" />
    <p className="text-lg font-medium mb-2">No dividend data</p>
    <p className="text-sm">No dividend distributions found for the selected period.</p>
  </div>
);

const CustomTooltip: React.FC<any> = ({ 
  active, 
  payload, 
  label, 
  viewMode, 
  currency = 'USD', 
  locale = 'en-US' 
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-48">
        <p className="text-sm text-muted-foreground mb-2">
          {formatDate(new Date(label), locale)}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">
              {viewMode === 'cumulative' ? 'Total' : 'Amount'}:
            </span>
            <span className="text-sm font-medium text-success">
              {formatCurrency(data.amount, currency, locale)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Main component
export default function DividendChart({
  data,
  isLoading = false,
  className = '',
  style,
  height = 300,
  defaultRange = "90d",
  defaultView = "cumulative",
  currency = 'USD',
  locale = 'en-US',
  onPointClick,
  title = "Dividend Distributions",
  description,
}: DividendChartProps) {
  const [selectedRange, setSelectedRange] = useState<Range>(defaultRange);
  const [selectedView, setSelectedView] = useState<ViewMode>(defaultView);

  const rangeOptions = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'all', label: 'All' },
  ];

  const viewOptions = [
    { value: 'cumulative', label: 'Cumulative' },
    { value: 'individual', label: 'Individual' },
  ];

  const processedData = useMemo(() => {
    return processData(data, selectedRange, selectedView);
  }, [data, selectedRange, selectedView]);

  const chartData = useMemo(() => {
    return processedData.map(item => ({
      ...item,
      dateFormatted: formatDate(item.date, locale),
      timestamp: item.date.getTime(),
    }));
  }, [processedData, locale]);

  if (isLoading) {
    return (
      <div className={`bg-surface-2 rounded-lg border border-border p-6 ${className}`} style={style}>
        <LoadingSkeleton height={height} />
      </div>
    );
  }

  return (
    <div 
      className={`bg-surface-2 rounded-lg border border-border p-6 ${className}`} 
      style={style}
      role="region"
      aria-label="Dividend chart"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={viewOptions}
            value={selectedView}
            onChange={(value) => setSelectedView(value as ViewMode)}
            ariaLabel="View mode selection"
          />
          <SegmentedControl
            options={rangeOptions}
            value={selectedRange}
            onChange={(value) => setSelectedRange(value as Range)}
            ariaLabel="Time range selection"
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }} className="w-full">
        {chartData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              onClick={onPointClick}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis
                dataKey="dateFormatted"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, currency, locale)}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    viewMode={selectedView}
                    currency={currency}
                    locale={locale}
                  />
                )}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  stroke: 'hsl(var(--chart-1))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--background))'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}