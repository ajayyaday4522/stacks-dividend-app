"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Web3LandingPage } from "@/components/LandingPage";
import { Navigation } from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import WalletConnection from "@/components/WalletConnection";
import DividendDashboard from "@/components/DividendDashboard";
import TokenHoldersTable from "@/components/TokenHoldersTable";
import AdminPanel from "@/components/AdminPanel";
import MarketPage from "@/components/MarketPage";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";
import TransactionToast, { beginTransaction } from "@/components/TransactionToast";
import DividendChart from "@/components/DividendChart";

// Mock data types
interface User {
  name?: string;
  address?: string;
  avatarUrl?: string;
}

interface DividendBalances {
  divBalance: number;
  claimableStx: number;
  totalDividendsReceived: number;
  tokenSupply: number;
}

interface DividendRecord {
  id: string;
  txId: string;
  amount: number;
  timestamp: string | number | Date;
}

interface TokenHolder {
  address: string;
  balance: number;
}

interface ContractStatus {
  paused: boolean;
  totalSupply?: string | number;
  contractAddress?: string;
  network?: string;
  lastDividendAt?: string | number | Date;
  ownerAddress?: string;
}

// Current active section type
type ActiveSection = "home" | "dashboard" | "market" | "profile" | "settings" | "holdings" | "admin";

export default function Page() {
  // Main navigation state
  const [currentPage, setCurrentPage] = useState<ActiveSection>("home");
  const [showDashboard, setShowDashboard] = useState(false);

  // Sidebar state (only for dashboard)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<"dashboard" | "holdings" | "admin" | "settings">("dashboard");

  // User and wallet state
  const [user, setUser] = useState<User>({ name: "Guest" });
  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Data state (for dashboard)
  const [dividendBalances, setDividendBalances] = useState<DividendBalances>({
    divBalance: 1250.75,
    claimableStx: 45.832,
    totalDividendsReceived: 234.56,
    tokenSupply: 1000000,
  });

  const [dividendHistory, setDividendHistory] = useState<DividendRecord[]>([
    {
      id: "1",
      txId: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
      amount: 12.5,
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "2", 
      txId: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g",
      amount: 8.75,
      timestamp: new Date(Date.now() - 172800000),
    },
  ]);

  const [chartData, setChartData] = useState([
    { date: new Date(Date.now() - 604800000), amount: 15.2 },
    { date: new Date(Date.now() - 518400000), amount: 22.8 },
    { date: new Date(Date.now() - 432000000), amount: 18.5 },
    { date: new Date(Date.now() - 345600000), amount: 31.4 },
    { date: new Date(Date.now() - 259200000), amount: 12.9 },
    { date: new Date(Date.now() - 172800000), amount: 8.75 },
    { date: new Date(Date.now() - 86400000), amount: 12.5 },
  ]);

  const [tokenHolders, setTokenHolders] = useState<TokenHolder[]>([
    { address: "SP1ABC123XYZ789DEF456GHI012JKL345MNO678PQR", balance: 50000 },
    { address: "SP2DEF456ABC789GHI012JKL345MNO678PQR901STU", balance: 35000 },
    { address: "SP3GHI789DEF123JKL456MNO789PQR012STU345VWX", balance: 28500 },
    { address: "SP4JKL012GHI456MNO789PQR123STU456VWX789YZA", balance: 22000 },
    { address: "SP5MNO345JKL789PQR012STU345VWX678YZA901BCD", balance: 18750 },
  ]);

  const [contractStatus, setContractStatus] = useState<ContractStatus>({
    paused: false,
    totalSupply: 1000000,
    contractAddress: "SP1CONTRACTADDRESS123456789ABCDEF",
    network: "mainnet",
    lastDividendAt: new Date(Date.now() - 86400000),
    ownerAddress: "SP1OWNERADDRESS123456789ABCDEF",
  });

  // Handlers
  const handleGetStarted = useCallback(() => {
    if (!walletConnected) {
      // If wallet not connected, connect first
      handleConnectWallet().then(() => {
        setCurrentPage("dashboard");
        setShowDashboard(true);
      });
    } else {
      // If wallet connected, go to dashboard
      setCurrentPage("dashboard");
      setShowDashboard(true);
    }
  }, [walletConnected]);

  const handleNavigate = useCallback((section: string) => {
    setCurrentPage(section as ActiveSection);
    if (section === "dashboard") {
      setShowDashboard(true);
    } else {
      setShowDashboard(false);
    }
  }, []);

  const handleConnectWallet = useCallback(async () => {
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletConnected(true);
      setUser({
        name: "John Doe",
        address: "SP1ABC123XYZ789DEF456GHI012JKL345MNO678PQR",
        avatarUrl: undefined,
      });
      setIsOwner(true); // For demo purposes
      toast.success("Wallet connected successfully");
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  }, []);

  const handleDisconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setUser({ name: "Guest" });
    setIsOwner(false);
    setCurrentPage("home");
    setShowDashboard(false);
    toast.success("Wallet disconnected");
  }, []);

  const handleClaimDividends = useCallback(async () => {
    const tx = beginTransaction({
      type: "claim",
      title: "Claiming dividends",
      message: "Processing your dividend claim...",
    });

    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      tx.toPending({ hash: "0xabcdef123456789" });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      tx.toConfirmed({
        message: `Successfully claimed ${dividendBalances.claimableStx.toFixed(6)} STX`,
      });

      // Update balances
      setDividendBalances(prev => ({
        ...prev,
        claimableStx: 0,
        totalDividendsReceived: prev.totalDividendsReceived + prev.claimableStx,
      }));
    } catch (error) {
      tx.toFailed({
        error: error instanceof Error ? error.message : "Claim failed",
      });
      throw error;
    }
  }, [dividendBalances.claimableStx]);

  const handleRefreshData = useCallback(async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would fetch fresh data from APIs
  }, []);

  const handleDeposit = useCallback(async (amount: number) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      txId: "0xdeposit123456789abcdef",
      success: true,
    };
  }, []);

  const handleMint = useCallback(async (recipient: string, amount: number) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      txId: "0xmint123456789abcdef",
      success: true,
    };
  }, []);

  const handleBurn = useCallback(async (recipient: string, amount: number) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      txId: "0xburn123456789abcdef",
      success: true,
    };
  }, []);

  const handlePause = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      txId: "0xpause123456789abcdef",
      success: true,
    };
  }, []);

  const handleUnpause = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      txId: "0xunpause123456789abcdef",
      success: true,
    };
  }, []);

  const fetchStatus = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return contractStatus;
  }, [contractStatus]);

  // Navigation handler for sidebar (dashboard only)
  const handleSectionChange = useCallback((section: string) => {
    const validSections: "dashboard" | "holdings" | "admin" | "settings"[] = ["dashboard", "holdings", "admin", "settings"];
    if (validSections.includes(section as "dashboard" | "holdings" | "admin" | "settings")) {
      setActiveSection(section as "dashboard" | "holdings" | "admin" | "settings");
    }
  }, []);

  // Render dashboard content
  const renderDashboardContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <DividendDashboard
              balances={dividendBalances}
              tokenSymbol="DIV"
              dividendSymbol="STX"
              tokenDecimals={2}
              dividendDecimals={6}
              history={dividendHistory}
              chartData={chartData}
              onClaim={handleClaimDividends}
              onRefresh={handleRefreshData}
              autoRefresh={true}
              refreshIntervalMs={15000}
            />
            <DividendChart
              data={chartData}
              isLoading={false}
              height={300}
              defaultRange="90d"
              defaultView="cumulative"
              currency="STX"
              title="Distribution History"
              description="Visual representation of dividend distributions over time"
            />
          </div>
        );

      case "holdings":
        return (
          <TokenHoldersTable
            holders={tokenHolders}
            totalSupply={dividendBalances.tokenSupply}
            dividendPool={dividendBalances.claimableStx}
            tokenSymbol="DIV"
            dividendSymbol="STX"
            pageSize={25}
            isLoading={false}
            initialSort="desc"
          />
        );

      case "admin":
        return (
          <AdminPanel
            isOwner={isOwner}
            status={contractStatus}
            onDeposit={handleDeposit}
            onMint={handleMint}
            onBurn={handleBurn}
            onPause={handlePause}
            onUnpause={handleUnpause}
            fetchStatus={fetchStatus}
            pollingIntervalMs={15000}
          />
        );

      case "settings":
        return (
          <div className="rounded-xl bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight mb-4">Settings</h2>
            <p className="text-muted-foreground">
              Settings panel coming soon. Configure your preferences and app behavior.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Render main content based on current page
  const renderMainContent = () => {
    switch (currentPage) {
      case "home":
        return <Web3LandingPage onGetStarted={handleGetStarted} />;
      
      case "market":
        return <MarketPage />;
      
      case "profile":
        return <ProfilePage />;
      
      case "settings":
        return <SettingsPage />;
      
      case "dashboard":
        return showDashboard ? (
          <div className="flex h-screen bg-background text-foreground">
            <Sidebar
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
              isOwner={isOwner}
              user={user}
              walletConnected={walletConnected}
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              routes={{
                dashboard: "#dashboard",
                holdings: "#holdings", 
                admin: "#admin",
                settings: "#settings",
              }}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                      {activeSection === "dashboard" && "Dashboard"}
                      {activeSection === "holdings" && "Token Holdings"}
                      {activeSection === "admin" && "Admin Panel"}
                      {activeSection === "settings" && "Settings"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {activeSection === "dashboard" && "Overview of your dividend tokens and distributions"}
                      {activeSection === "holdings" && "Token holder leaderboard and distribution details"}
                      {activeSection === "admin" && "Administrative controls for contract management"}
                      {activeSection === "settings" && "Application preferences and configuration"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <WalletConnection
                    appName="FinoVault dApp"
                    network="mainnet"
                    showBalance={true}
                    onConnected={(address) => {
                      setWalletConnected(true);
                      setUser(prev => ({ ...prev, address }));
                      setIsOwner(address === contractStatus.ownerAddress);
                    }}
                    onDisconnected={handleDisconnectWallet}
                    onError={(error) => {
                      toast.error("Wallet error", {
                        description: error.message,
                      });
                    }}
                  />
                </div>
              </header>

              <div className="flex-1 overflow-auto">
                <div className="container mx-auto p-6 max-w-7xl">
                  <nav className="mb-6 flex space-x-6 border-b border-border">
                    {[
                      { key: "dashboard", label: "Dashboard" },
                      { key: "holdings", label: "Holdings" },
                      ...(isOwner ? [{ key: "admin", label: "Admin" }] : []),
                      { key: "settings", label: "Settings" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleSectionChange(item.key)}
                        className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                          activeSection === item.key
                            ? "border-primary text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  {renderDashboardContent()}
                </div>
              </div>
            </main>
          </div>
        ) : null;
      
      default:
        return <Web3LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - only show if not on dashboard or home page */}
      {currentPage !== "home" && !showDashboard && (
        <Navigation
          activeSection={currentPage}
          onNavigate={handleNavigate}
          walletConnected={walletConnected}
          onWalletConnect={handleConnectWallet}
          userAddress={user.address}
        />
      )}

      {/* Main Content */}
      <main className={currentPage !== "home" && !showDashboard ? "pt-16" : ""}>
        {renderMainContent()}
      </main>

      <TransactionToast
        position="top-right"
        theme="dark"
        closeButton={true}
      />
    </div>
  );
}