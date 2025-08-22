"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, Wallet, BarChart3, Globe, Code, Database, Smartphone } from 'lucide-react';

interface Web3LandingPageProps {
  onGetStarted: () => void;
}

export const Web3LandingPage: React.FC<Web3LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#c0c0c0] overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2ed3b7]/20 via-transparent to-[#f0b289]/20" />
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(192, 192, 192, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(192, 192, 192, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'float 20s ease-in-out infinite'
            }}
          />
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#2ed3b7] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2ed3b7]/5 via-transparent to-[#f0b289]/5 animate-pulse" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-[#c0c0c0] via-[#2ed3b7] to-[#f0b289] bg-clip-text text-transparent"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              FinoVault
            </h1>
            <motion.p 
              className="text-xl md:text-2xl text-[#c0c0c0]/80 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              The Future of Decentralized Finance
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#2ed3b7] to-[#f0b289] hover:from-[#f0b289] hover:to-[#2ed3b7] text-[#0a0a0a] font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(46,211,183,0.5)] group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-[#c0c0c0]"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              Web3 Capabilities
            </h2>
            <p className="text-lg text-[#c0c0c0]/70 max-w-2xl mx-auto">
              Revolutionizing finance through blockchain technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Dividend Distribution",
                description: "Automated and transparent dividend payments powered by smart contracts"
              },
              {
                icon: Zap,
                title: "Smart Contracts",
                description: "Secure and efficient contract execution on the Stacks blockchain"
              },
              {
                icon: Wallet,
                title: "Wallet Integration",
                description: "Seamless integration with popular Web3 wallets"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Live insights and performance tracking for your investments"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#333] hover:border-[#2ed3b7]/50 transition-all duration-300 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(46,211,183,0.2)] group">
                  <feature.icon className="h-12 w-12 text-[#2ed3b7] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 
                    className="text-xl font-semibold mb-3 text-[#c0c0c0]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-[#c0c0c0]/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-[#c0c0c0]"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              Built on Cutting-Edge Technology
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Globe, name: "Stacks Blockchain", color: "#2ed3b7" },
              { icon: Code, name: "Smart Contracts", color: "#f0b289" },
              { icon: Database, name: "TypeScript", color: "#2ed3b7" },
              { icon: Smartphone, name: "Next.js", color: "#f0b289" }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-[#333] flex items-center justify-center group-hover:border-[#2ed3b7]/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(46,211,183,0.3)]">
                  <tech.icon className="h-8 w-8" style={{ color: tech.color }} />
                </div>
                <p 
                  className="text-[#c0c0c0] font-medium group-hover:text-[#2ed3b7] transition-colors"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  {tech.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="p-12 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border-[#333] backdrop-blur-lg">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-6 text-[#c0c0c0]"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                About FinoVault
              </h2>
              <p className="text-lg text-[#c0c0c0]/80 leading-relaxed mb-8">
                FinoVault represents the next evolution in decentralized finance, offering a comprehensive platform 
                for dividend distribution and token management built on the robust Stacks blockchain. Our mission 
                is to democratize access to financial tools while maintaining the highest standards of security 
                and transparency.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#2ed3b7] mb-2">10K+</div>
                  <div className="text-[#c0c0c0]/70">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#f0b289] mb-2">$50M+</div>
                  <div className="text-[#c0c0c0]/70">Total Value Locked</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#2ed3b7] mb-2">99.9%</div>
                  <div className="text-[#c0c0c0]/70">Uptime</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#c0c0c0] via-[#2ed3b7] to-[#f0b289] bg-clip-text text-transparent"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              Ready to Start Your DeFi Journey?
            </h2>
            <p className="text-xl text-[#c0c0c0]/80 mb-10 max-w-2xl mx-auto">
              Join thousands of users who trust FinoVault for their decentralized finance needs.
            </p>
            <Button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#2ed3b7] to-[#f0b289] hover:from-[#f0b289] hover:to-[#2ed3b7] text-[#0a0a0a] font-semibold px-12 py-6 text-xl rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(46,211,183,0.6)] group"
            >
              Launch App
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};