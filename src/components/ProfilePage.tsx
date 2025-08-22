"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Edit3, 
  Wallet, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Bell, 
  Copy, 
  Check,
  Filter,
  Search,
  Trophy,
  Star,
  Eye,
  EyeOff,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Mock data
const mockUser = {
  name: "Alex Rivera",
  username: "alexrivera",
  email: "alex.rivera@email.com",
  avatar: "/api/placeholder/150/150",
  walletAddress: "SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B",
  memberSince: "March 2023",
  bio: "DeFi enthusiast and yield farming strategist",
  totalPortfolioValue: 485672.34,
  totalProfit: 125438.92,
  profitPercentage: 34.8,
  achievements: ["Early Adopter", "Whale Investor", "Diamond Hands", "Yield Master"]
};

const mockPortfolioData = [
  { date: '2024-01', value: 125000 },
  { date: '2024-02', value: 180000 },
  { date: '2024-03', value: 220000 },
  { date: '2024-04', value: 195000 },
  { date: '2024-05', value: 285000 },
  { date: '2024-06', value: 320000 },
  { date: '2024-07', value: 485672 }
];

const mockAssetAllocation = [
  { name: 'STX', value: 45, amount: 218552.53, color: '#2ed3b7' },
  { name: 'USDC', value: 25, amount: 121418.09, color: '#f0b289' },
  { name: 'BTC', value: 15, value: 15, amount: 72850.85, color: '#22c55e' },
  { name: 'ETH', value: 10, amount: 48567.23, color: '#64d7c2' },
  { name: 'Others', value: 5, amount: 24283.64, color: '#8a9590' }
];

const mockHoldings = [
  { 
    symbol: 'STX', 
    name: 'Stacks', 
    amount: 125000, 
    value: 218552.53, 
    change24h: 5.67, 
    price: 1.75 
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    amount: 121418, 
    value: 121418.09, 
    change24h: 0.01, 
    price: 1.00 
  },
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    amount: 1.25, 
    value: 72850.85, 
    change24h: -2.34, 
    price: 58280.68 
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    amount: 15.2, 
    value: 48567.23, 
    change24h: 3.45, 
    price: 3195.21 
  }
];

const mockTransactions = [
  {
    id: '1',
    type: 'Buy',
    token: 'STX',
    amount: 5000,
    value: 8750,
    price: 1.75,
    date: '2024-07-15',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
  },
  {
    id: '2',
    type: 'Sell',
    token: 'USDC',
    amount: 10000,
    value: 10000,
    price: 1.00,
    date: '2024-07-14',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'
  },
  {
    id: '3',
    type: 'Stake',
    token: 'STX',
    amount: 25000,
    value: 43750,
    price: 1.75,
    date: '2024-07-12',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
  }
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [user, setUser] = useState(mockUser);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(user.walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Save logic here
  };

  const filteredTransactions = mockTransactions.filter(tx => 
    (transactionFilter === 'all' || tx.type.toLowerCase() === transactionFilter) &&
    (tx.token.toLowerCase().includes(searchTerm.toLowerCase()) || 
     tx.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
              <Avatar className="h-24 w-24 border-4 border-background mb-4 md:mb-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold font-heading">{user.name}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={user.name} 
                            onChange={(e) => setUser({...user, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={user.username} 
                            onChange={(e) => setUser({...user, username: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Input 
                            id="bio" 
                            value={user.bio} 
                            onChange={(e) => setUser({...user, bio: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleSaveProfile} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <p className="text-foreground">{user.bio}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="font-mono">
                      {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-8)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCopyAddress}
                      className="h-6 w-6 p-0"
                    >
                      {copiedAddress ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {user.memberSince}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {user.achievements.map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user.totalPortfolioValue.toLocaleString()}</div>
                  <div className="flex items-center text-sm text-success mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{user.profitPercentage}% all time
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">+${user.totalProfit.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Since {user.memberSince}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">+$12,847</div>
                  <div className="flex items-center text-sm text-success mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +2.71%
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockPortfolioData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Asset Allocation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockAssetAllocation}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {mockAssetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `$${props.payload.amount.toLocaleString()}`,
                          props.payload.name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Holdings Tab */}
        <TabsContent value="holdings">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Asset Holdings</CardTitle>
                <CardDescription>Your current token holdings and their values</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">24h Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHoldings.map((holding) => (
                      <TableRow key={holding.symbol}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-bold">{holding.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <div className="font-medium">{holding.symbol}</div>
                              <div className="text-sm text-muted-foreground">{holding.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{holding.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${holding.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">${holding.value.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={holding.change24h >= 0 ? 'text-success' : 'text-destructive'}>
                            {holding.change24h >= 0 ? '+' : ''}{holding.change24h}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your recent trading activity</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="stake">Stake</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead>Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge variant={tx.type === 'Buy' ? 'default' : tx.type === 'Sell' ? 'destructive' : 'secondary'}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{tx.token}</TableCell>
                        <TableCell className="text-right">{tx.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${tx.value.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{new Date(tx.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-muted-foreground">
                            {tx.txHash.slice(0, 10)}...
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredTransactions.length} of {mockTransactions.length} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive security alerts via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">Recovery Phrase</h4>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                    >
                      {showSeedPhrase ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showSeedPhrase ? 'Hide' : 'Show'} Recovery Phrase
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup
                    </Button>
                  </div>
                  
                  {showSeedPhrase && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-muted rounded-lg"
                    >
                      <div className="grid grid-cols-4 gap-2 text-sm font-mono">
                        {['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'].map((word, index) => (
                          <span key={index} className="p-2 bg-background rounded text-center">
                            {index + 1}. {word}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        ⚠️ Never share your recovery phrase with anyone. Store it in a safe place.
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Price Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified about significant price changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Transaction Confirmations</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications for completed transactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Portfolio Summary</h4>
                    <p className="text-sm text-muted-foreground">Get a weekly summary of your portfolio performance</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">DeFi Yield Opportunities</h4>
                    <p className="text-sm text-muted-foreground">Be notified about new yield farming opportunities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}