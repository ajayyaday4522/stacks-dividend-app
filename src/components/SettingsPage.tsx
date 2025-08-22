"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import { 
  Settings, 
  Shield, 
  Lock, 
  Eye, 
  TrendingUp, 
  Bell, 
  Code, 
  Palette,
  Globe,
  Clock,
  Smartphone,
  Mail,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";

interface SettingsState {
  // General Settings
  theme: "dark" | "light";
  language: string;
  timezone: string;
  currency: string;
  
  // Security Settings
  twoFactorEnabled: boolean;
  biometricLogin: boolean;
  sessionTimeout: number;
  
  // Privacy Settings
  dataSharing: boolean;
  analyticsTracking: boolean;
  marketingEmails: boolean;
  
  // Trading Settings
  slippageTolerance: number;
  gasPreference: "standard" | "fast" | "instant";
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  notificationFrequency: "realtime" | "hourly" | "daily";
  
  // Advanced Settings
  developerMode: boolean;
  experimentalFeatures: boolean;
  debugMode: boolean;
}

const defaultSettings: SettingsState = {
  theme: "dark",
  language: "en",
  timezone: "UTC",
  currency: "USD",
  twoFactorEnabled: false,
  biometricLogin: false,
  sessionTimeout: 30,
  dataSharing: false,
  analyticsTracking: true,
  marketingEmails: false,
  slippageTolerance: 0.5,
  gasPreference: "standard",
  autoRefresh: true,
  refreshInterval: 30,
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
  notificationFrequency: "realtime",
  developerMode: false,
  experimentalFeatures: false,
  debugMode: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    setTimeout(() => {
      setHasUnsavedChanges(false);
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);
    }, 500);
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(false);
    setShowResetDialog(false);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'defi-platform-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const tabItems = [
    { value: "general", label: "General", icon: Settings },
    { value: "security", label: "Security", icon: Shield },
    { value: "privacy", label: "Privacy", icon: Eye },
    { value: "trading", label: "Trading", icon: TrendingUp },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "advanced", label: "Advanced", icon: Code },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-muted-foreground mt-2">
                Customize your DeFi platform experience
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSettings}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              
              <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Settings</DialogTitle>
                    <DialogDescription>
                      This will reset all settings to their default values. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleResetSettings}>
                      Reset All Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning">You have unsaved changes</span>
            </motion.div>
          )}
        </motion.div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full bg-card/50 backdrop-blur-sm">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize the visual theme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: "dark" | "light") => updateSetting("theme", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Localization
                  </CardTitle>
                  <CardDescription>Language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSetting("language", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => updateSetting("timezone", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                        <SelectItem value="CET">CET</SelectItem>
                        <SelectItem value="JST">JST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => updateSetting("currency", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Authentication
                  </CardTitle>
                  <CardDescription>Secure your account access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="2fa">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch
                      id="2fa"
                      checked={settings.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSetting("twoFactorEnabled", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="biometric">Biometric Login</Label>
                      <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                    </div>
                    <Switch
                      id="biometric"
                      checked={settings.biometricLogin}
                      onCheckedChange={(checked) => updateSetting("biometricLogin", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Session Management
                  </CardTitle>
                  <CardDescription>Control session timeouts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <div className="px-3">
                      <Slider
                        value={[settings.sessionTimeout]}
                        onValueChange={(value) => updateSetting("sessionTimeout", value[0])}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>5 min</span>
                        <span>{settings.sessionTimeout} min</span>
                        <span>120 min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Data & Privacy
                  </CardTitle>
                  <CardDescription>Control how your data is used</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share anonymized usage data</p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) => updateSetting("dataSharing", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics">Analytics Tracking</Label>
                      <p className="text-sm text-muted-foreground">Help improve the platform</p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={settings.analyticsTracking}
                      onCheckedChange={(checked) => updateSetting("analyticsTracking", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive product updates and offers</p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Trading Settings */}
          <TabsContent value="trading" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trading Preferences
                  </CardTitle>
                  <CardDescription>Configure your trading settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Slippage Tolerance (%)</Label>
                    <div className="px-3">
                      <Slider
                        value={[settings.slippageTolerance]}
                        onValueChange={(value) => updateSetting("slippageTolerance", value[0])}
                        max={5}
                        min={0.1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>0.1%</span>
                        <span>{settings.slippageTolerance}%</span>
                        <span>5%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <Label>Gas Preference</Label>
                    <Select
                      value={settings.gasPreference}
                      onValueChange={(value: "standard" | "fast" | "instant") => updateSetting("gasPreference", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="instant">Instant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Auto-Refresh
                  </CardTitle>
                  <CardDescription>Configure data refresh settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-refresh">Auto-Refresh Data</Label>
                      <p className="text-sm text-muted-foreground">Automatically update prices and balances</p>
                    </div>
                    <Switch
                      id="auto-refresh"
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => updateSetting("autoRefresh", checked)}
                    />
                  </div>
                  
                  {settings.autoRefresh && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label>Refresh Interval (seconds)</Label>
                      <div className="px-3">
                        <Slider
                          value={[settings.refreshInterval]}
                          onValueChange={(value) => updateSetting("refreshInterval", value[0])}
                          max={300}
                          min={10}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>10s</span>
                          <span>{settings.refreshInterval}s</span>
                          <span>5m</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Types
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="sound-notifications">Sound Notifications</Label>
                    </div>
                    <Switch
                      id="sound-notifications"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Frequency
                  </CardTitle>
                  <CardDescription>Control notification frequency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Notification Frequency</Label>
                    <Select
                      value={settings.notificationFrequency}
                      onValueChange={(value: "realtime" | "hourly" | "daily") => updateSetting("notificationFrequency", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Notification Types</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Price Alerts</Badge>
                          <Badge variant="secondary" className="text-xs">Trade Updates</Badge>
                          <Badge variant="secondary" className="text-xs">Security</Badge>
                          <Badge variant="secondary" className="text-xs">System</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Developer Options
                  </CardTitle>
                  <CardDescription>Advanced features for developers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="developer-mode">Developer Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable advanced debugging features</p>
                    </div>
                    <Switch
                      id="developer-mode"
                      checked={settings.developerMode}
                      onCheckedChange={(checked) => updateSetting("developerMode", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="experimental">Experimental Features</Label>
                      <p className="text-sm text-muted-foreground">Access beta features (use with caution)</p>
                    </div>
                    <Switch
                      id="experimental"
                      checked={settings.experimentalFeatures}
                      onCheckedChange={(checked) => updateSetting("experimentalFeatures", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="debug">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">Show detailed logs and errors</p>
                    </div>
                    <Switch
                      id="debug"
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => updateSetting("debugMode", checked)}
                    />
                  </div>
                  
                  {settings.developerMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-destructive">Warning</p>
                          <p className="text-sm text-destructive/80">
                            Developer mode enables advanced features that may affect platform stability.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportSettings}
          className="hidden"
        />

        {/* Save Confirmation Toast */}
        <AnimatePresence>
          {showSaveConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 50, x: "-50%" }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
            >
              <Check className="h-4 w-4" />
              <span>Settings saved successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}