"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  walletConnected: boolean;
  onWalletConnect: () => void;
  userAddress?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onNavigate,
  walletConnected,
  onWalletConnect,
  userAddress
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'market', label: 'Market' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' }
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <div 
              className="text-2xl font-bold cursor-pointer"
              style={{ fontFamily: 'Orbitron, monospace' }}
              onClick={() => onNavigate('home')}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Web3Stack
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={onWalletConnect}
              variant={walletConnected ? "secondary" : "default"}
              className={`relative overflow-hidden ${
                walletConnected
                  ? 'bg-surface-1 hover:bg-surface-2 text-foreground border border-border'
                  : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground'
              }`}
            >
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wallet size={16} />
                <span className="text-sm font-medium">
                  {walletConnected 
                    ? userAddress 
                      ? formatAddress(userAddress)
                      : 'Connected'
                    : 'Connect Wallet'
                  }
                </span>
                {walletConnected && (
                  <motion.div
                    className="w-2 h-2 bg-success rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-foreground hover:text-primary"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-black/40 backdrop-blur-xl rounded-lg mt-2 border border-white/10"
            >
              <div className="px-4 py-4 space-y-3">
                {/* Mobile Navigation Items */}
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30'
                        : 'text-foreground hover:bg-white/5 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}

                {/* Mobile Wallet Connection */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navigationItems.length * 0.1, duration: 0.3 }}
                  className="pt-3 border-t border-white/10"
                >
                  <Button
                    onClick={() => {
                      onWalletConnect();
                      setIsMobileMenuOpen(false);
                    }}
                    variant={walletConnected ? "secondary" : "default"}
                    className={`w-full ${
                      walletConnected
                        ? 'bg-surface-1 hover:bg-surface-2 text-foreground border border-border'
                        : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Wallet size={16} />
                      <span className="text-sm font-medium">
                        {walletConnected 
                          ? userAddress 
                            ? formatAddress(userAddress)
                            : 'Connected'
                          : 'Connect Wallet'
                        }
                      </span>
                      {walletConnected && (
                        <motion.div
                          className="w-2 h-2 bg-success rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};