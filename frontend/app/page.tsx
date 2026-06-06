"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { getPoolStats, PoolStats } from "@/lib/sacco";
import { config } from "@/lib/config";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  BarChart3, 
  Coins, 
  Banknote,
  Globe,
  Zap,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPoolStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-20 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12">
        <div className="absolute top-0 right-0 -z-10 w-full sm:w-[500px] h-[500px] bg-sacco/5 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 -z-10 w-full sm:w-[300px] h-[300px] bg-sacco-accent/5 rounded-full blur-[80px] opacity-60" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8 max-w-4xl mx-auto px-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sacco-light border border-sacco/20 text-sacco-dark text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 fill-current" />
            Now live on Stellar Testnet
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Transparent savings. <br />
            <span className="text-sacco">Trustless lending.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            SaccoChain puts your savings group on Stellar. Deposit USDC, earn
            yield, and borrow up to 2× your contribution — every transaction
            visible to every member.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <ConnectButton />
            <Link 
              href="/dashboard" 
              className="btn-secondary group px-8 py-3 text-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all rounded-2xl"
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4"
      >
        <StatCard
          icon={Coins}
          label="Total pool size"
          value={stats ? `${stats.totalSupplyUsdc.toLocaleString()} USDC` : "—"}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Banknote}
          label="Total borrowed"
          value={stats ? `${stats.totalBorrowUsdc.toLocaleString()} USDC` : "—"}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Target apr"
          value={`${config.targetApr}%`}
          color="bg-amber-50 text-amber-600"
        />
      </motion.section>

      {error && (
        <div className="px-4">
          <div className="card border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row items-center gap-3 text-red-800 rounded-2xl">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold text-center sm:text-left break-words">
              Pool stats unavailable: {error}. Check your connection.
            </p>
          </div>
        </div>
      )}

      {/* Steps Section */}
      <section className="space-y-16 px-4 max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">How it works</h2>
          <p className="text-slate-500 text-lg sm:text-xl max-w-xl mx-auto font-medium">
            Join the decentralized SACCO revolution in minutes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          <Step
            n={1}
            icon={Globe}
            title="Connect Wallet"
            body="Install Freighter, switch to testnet, and link your account to get started."
          />
          <Step
            n={2}
            icon={Zap}
            title="Deposit Assets"
            body="Provide USDC collateral to the pool and start earning yield immediately."
          />
          <Step
            n={3}
            icon={Users}
            title="Access Credit"
            body="Borrow up to 200% of your deposit instantly with transparent repayment."
          />
        </div>
      </section>

      {/* Why SaccoChain Section */}
      <div className="px-4 max-w-6xl mx-auto">
        <section className="card bg-slate-900 text-white overflow-hidden relative border-none shadow-3xl shadow-slate-900/40 rounded-[3rem]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sacco/10 rounded-full blur-[100px] -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sacco-accent/10 rounded-full blur-[100px] -ml-40 -mb-40" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center p-8 sm:p-12 lg:p-16">
            <div className="space-y-8 sm:space-y-10">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.9] tracking-tighter">
                Why bring your <br className="hidden sm:block" /> SACCO on-chain?
              </h2>
              <ul className="space-y-6 sm:space-y-8">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-1 border border-white/10 shadow-inner">
                    <CheckCircle2 className="w-5 h-5 text-sacco-accent" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-xl sm:text-2xl tracking-tight">Full Transparency</h4>
                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium">Every transaction is on the immutable Stellar ledger for all to see.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-1 border border-white/10 shadow-inner">
                    <CheckCircle2 className="w-5 h-5 text-sacco-accent" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-xl sm:text-2xl tracking-tight">Instant Payouts</h4>
                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium">Eliminate paperwork. Borrow and repay in seconds from anywhere.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-1 border border-white/10 shadow-inner">
                    <CheckCircle2 className="w-5 h-5 text-sacco-accent" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-xl sm:text-2xl tracking-tight">Zero Middlemen</h4>
                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium">Direct peer-to-pool interaction ensures maximum returns for members.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 lg:p-12 border border-white/10 shadow-3xl">
              <div className="w-16 h-16 rounded-2xl bg-sacco-accent/20 flex items-center justify-center mb-8">
                <BarChart3 className="w-8 h-8 text-sacco-accent" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 italic leading-tight tracking-tight text-white/95">
                "Digitizing traditional African savings groups to unlock global financial access."
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sacco to-sacco-dark shadow-lg" />
                <div>
                  <p className="font-black text-lg tracking-tight">Team SaccoChain</p>
                  <p className="text-[10px] text-sacco-accent font-black uppercase tracking-[0.2em]">Web3bridge 2026</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: string; color: string; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card flex flex-col items-center text-center space-y-4 p-10 border-slate-100/50 shadow-2xl shadow-slate-200/40 rounded-[2.5rem]"
    >
      <div className={cn("p-4 rounded-2xl mb-2 shadow-sm transition-transform duration-500 group-hover:rotate-12", color)}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="stat-label">{label}</div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
    </motion.div>
  );
}

function Step({ n, icon: Icon, title, body }: { n: number; icon: any; title: string; body: string }) {
  return (
    <div className="relative group">
      <div className="card h-full flex flex-col p-8 sm:p-10 border-slate-100/50 hover:border-sacco/30 hover:shadow-3xl transition-all duration-500 rounded-[2.5rem] bg-white">
        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-sacco-light transition-all duration-500 group-hover:rotate-6 shadow-inner">
            <Icon className="w-7 h-7 text-sacco" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:bg-sacco transition-all duration-500">
            {n}
          </div>
        </div>
        <h3 className="font-black text-xl mb-4 text-slate-900 tracking-tight">{title}</h3>
        <p className="text-slate-500 text-base leading-relaxed font-medium">{body}</p>
      </div>
    </div>
  );
}
