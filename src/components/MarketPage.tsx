"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  Filter
} from 'lucide-react';

// Mock data for cryptocurrency market
const mockTokens = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67540.23,
    change24h: 2.45,
    volume: 28400000000,
    marketCap: 1330000000000,
    logo: '₿',
    isStarred: false
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3789.45,
    change24h: -0.87,
    volume: 15600000000,
    marketCap: 455000000000,
    logo: 'Ξ',
    isStarred: true
  },
  {
    id: 'stacks',
    symbol: 'STX',
    name: 'Stacks',
    price: 2.34,
    change24h: 5.67,
    volume: 89000000,
    marketCap: 3400000000,
    logo: '⟁',
    isStarred: true
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.58,
    change24h: -2.14,
    volume: 456000000,
    marketCap: 20500000000,
    logo: '₳',
    isStarred: false
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 89.23,
    change24h: 7.82,
    volume: 1800000000,
    marketCap: 42000000000,
    logo: '◎',
    isStarred: false
  }
];

const mockChartData = [
  { time: '00:00', price: 65432 },
  { time: '04:00', price: 66123 },
  { time: '08:00', price: 67890 },
  { time: '12:00', price: 67234 },
  { time: '16:00', price: 68567 },
  { time: '20:00', price: 67540 }
];

const mockTransactions = [
  {
    id: '1',
    type: 'buy',
    token: 'BTC',
    amount: 0.5,
    price: 67540.23,
    time: '2 minutes ago',
    hash: '0x1a2b3c...'
  },
  {
    id: '2',
    type: 'sell',
    token: 'ETH',
    amount: 2.3,
    price: 3789.45,
    time: '5 minutes ago',
    hash: '0x4d5e6f...'
  },
  {
    id: '3',
    type: 'buy',
    token: 'STX',
    amount: 1000,
    price: 2.34,
    time: '8 minutes ago',
    hash: '0x7g8h9i...'
  }
];

const MarketMetricCard = ({ title, value, change, icon: Icon }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const formatValue = (val) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <div className="text-2xl font-bold font-heading">
                {formatValue(displayValue)}
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                change >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TokenRow = ({ token, index }) => {
  const [isStarred, setIsStarred] = useState(token.isStarred);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-200"
    >
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsStarred(!isStarred)}
            className="transition-colors duration-200"
          >
            <Star 
              className={`w-4 h-4 ${isStarred ? 'text-warning fill-warning' : 'text-muted-foreground hover:text-warning'}`} 
            />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center font-bold text-sm">
              {token.logo}
            </div>
            <div>
              <div className="font-semibold">{token.symbol}</div>
              <div className="text-sm text-muted-foreground">{token.name}</div>
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 font-mono font-semibold">
        ${token.price.toLocaleString()}
      </td>
      <td className="py-4 px-4">
        <div className={`flex items-center space-x-1 ${
          token.change24h >= 0 ? 'text-success' : 'text-danger'
        }`}>
          {token.change24h >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span className="font-semibold">{Math.abs(token.change24h)}%</span>
        </div>
      </td>
      <td className="py-4 px-4 font-mono">
        ${(token.volume / 1e9).toFixed(2)}B
      </td>
      <td className="py-4 px-4 font-mono">
        ${(token.marketCap / 1e9).toFixed(2)}B
      </td>
      <td className="py-4 px-4">
        <Button variant="outline" size="sm" className="hover:bg-primary/10">
          Trade
        </Button>
      </td>
    </motion.tr>
  );
};

const PriceChart = ({ data, selectedToken }) => {
  return (
    <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="font-heading">Price Chart - {selectedToken}</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">1H</Button>
            <Button variant="outline" size="sm">24H</Button>
            <Button variant="default" size="sm">7D</Button>
            <Button variant="outline" size="sm">30D</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionItem = ({ transaction, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          transaction.type === 'buy' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
        }`}>
          {transaction.type === 'buy' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
        <div>
          <div className="font-semibold">
            {transaction.type === 'buy' ? 'Buy' : 'Sell'} {transaction.token}
          </div>
          <div className="text-sm text-muted-foreground">
            {transaction.amount} {transaction.token} • ${transaction.price.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-muted-foreground">{transaction.time}</div>
        <div className="text-xs text-muted-foreground font-mono">{transaction.hash}</div>
      </div>
    </motion.div>
  );
};

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState('BTC');
  const [sortBy, setSortBy] = useState('marketCap');
  const [filteredTokens, setFilteredTokens] = useState(mockTokens);

  useEffect(() => {
    const filtered = mockTokens.filter(token =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTokens(filtered);
  }, [searchTerm]);

  const marketMetrics = {
    totalMarketCap: 2800000000000,
    volume24h: 89400000000,
    dominance: 52.4,
    activeTokens: 15847
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Market Overview
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time cryptocurrency market data and trading insights
          </p>
        </motion.div>

        {/* Market Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MarketMetricCard
            title="Total Market Cap"
            value={marketMetrics.totalMarketCap}
            change={2.45}
            icon={DollarSign}
          />
          <MarketMetricCard
            title="24h Volume"
            value={marketMetrics.volume24h}
            change={-1.23}
            icon={BarChart3}
          />
          <MarketMetricCard
            title="BTC Dominance"
            value={marketMetrics.dominance}
            change={0.87}
            icon={Activity}
          />
          <MarketMetricCard
            title="Active Tokens"
            value={marketMetrics.activeTokens}
            change={1.45}
            icon={TrendingUp}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token Listings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading">Market Tokens</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tokens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20 border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Token</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">24h %</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Volume</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Market Cap</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTokens.map((token, index) => (
                        <TokenRow key={token.id} token={token} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            <PriceChart data={mockChartData} selectedToken={selectedToken} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trading Pairs */}
            <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-heading">Top Trading Pairs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['BTC/USDT', 'ETH/USDT', 'STX/BTC', 'ADA/USDT', 'SOL/USDT'].map((pair, index) => (
                  <motion.div
                    key={pair}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                    onClick={() => setSelectedToken(pair.split('/')[0])}
                  >
                    <div className="font-semibold">{pair}</div>
                    <div className="text-success text-sm">+2.45%</div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center font-heading">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-80 overflow-y-auto">
                  {mockTransactions.map((transaction, index) => (
                    <TransactionItem key={transaction.id} transaction={transaction} index={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}