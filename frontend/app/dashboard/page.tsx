"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { ActionPanel } from "@/components/ActionPanel";
import {
  getMemberStats,
  MemberStats,
  watchWallet,
} from "@/lib/sacco";
import { isSimulatorMode } from "@/lib/simulator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  AlertTriangle,
  Info,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => watchWallet(setAddress), []);

  useEffect(() => {
    if (!address) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setError(null);
    setLoading(true);
    
    getMemberStats(address)
      .then((s) => !cancelled && setStats(s))
      .catch((e) => {
        if (!cancelled) {
          const msg = e.message ?? String(e);
          setError(msg);
          // Only show toast if error is not already shown in the UI
          toast.error("Failed to load stats", { 
            description: msg,
            duration: 5000 
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
      
    return () => {
      cancelled = true;
    };
  }, [address, refreshTick]);

  // Make the inline error disappear after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onTxSuccess = () => setRefreshTick((t) => t + 1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 sm:space-y-12 pb-20 w-full"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-sacco font-bold tracking-normal text-sm lowercase first-letter:uppercase">
            <LayoutDashboard className="w-4 h-4" />
            Member portal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">My SaccoChain</h1>
          <p className="text-slate-500 text-base sm:text-lg md:text-xl font-medium">
            Manage your digital collateral and credit line.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 px-4">
          {address && (
            <motion.button 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={() => setRefreshTick(t => t + 1)}
              className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-sacco hover:border-sacco/30 transition-all"
              title="Refresh data"
            >
              <RefreshCw className={cn("w-5 h-5 sm:w-6 sm:h-6", loading && "animate-spin")} />
            </motion.button>
          )}
          <ConnectButton />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!address ? (
          <motion.div 
            key="not-connected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-auto card p-8 sm:p-20 text-center space-y-8 border-dashed border-4 border-slate-200 bg-slate-50/30 rounded-[2rem] sm:rounded-[3rem] w-full"
          >
            <div className="w-20 h-20 sm:w-24 h-24 rounded-[1.5rem] sm:rounded-[2rem] bg-white flex items-center justify-center mx-auto shadow-xl shadow-slate-200/50">
              <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Connect to begin</h3>
              <p className="text-slate-500 text-base sm:text-lg max-w-sm mx-auto font-medium leading-relaxed px-4">
                Connect your Freighter wallet to access your deposits and borrow USDC.
              </p>
            </div>
            <div className="flex justify-center px-4">
              <ConnectButton />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 sm:space-y-16"
          >
            <div className="w-full">
              <div className={cn(
                "rounded-[1.5rem] sm:rounded-[2rem] border-2 px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm",
                isSimulatorMode() 
                  ? "border-sacco/20 bg-sacco-light/30 text-sacco-dark" 
                  : "border-amber-200 bg-amber-50 text-amber-900"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  isSimulatorMode() ? "bg-sacco/10" : "bg-amber-100"
                )}>
                  {isSimulatorMode() ? (
                    <Info className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div className="text-sm sm:text-base leading-relaxed font-medium overflow-hidden">
                  {isSimulatorMode() ? (
                    <>
                      <span className="font-black tracking-normal text-xs block mb-1">Simulator active</span>
                      <p className="break-all sm:break-normal">Transactions are local. Contract: <code className="bg-sacco/10 px-2 py-0.5 rounded font-mono font-bold text-xs">CBY2WIY6…W7DDF</code></p>
                    </>
                  ) : (
                    <>
                      <span className="font-black tracking-normal text-xs block mb-1">Live testnet</span>
                      <p className="break-all sm:break-normal">Real Stellar transactions. Contract: <code className="bg-amber-100 px-2 py-0.5 rounded font-mono font-bold text-xs">CBY2WIY6…W7DDF</code></p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <StatCard
                label="My deposit"
                value={stats ? `${fmt(stats.deposit)} USDC` : "—"}
                icon={ArrowDownLeft}
                loading={loading}
              />
              <StatCard
                label="My borrow"
                value={stats ? `${fmt(stats.borrow)} USDC` : "—"}
                icon={ArrowUpRight}
                loading={loading}
              />
              <StatCard
                label="Credit available"
                value={stats ? `${fmt(stats.availableToBorrow)} USDC` : "—"}
                icon={CreditCard}
                highlight
                loading={loading}
              />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 sm:gap-12">
              <div className="xl:col-span-7 w-full overflow-hidden">
                <ActionPanel
                  address={address}
                  availableToBorrow={stats?.availableToBorrow ?? 0n}
                  currentBorrow={stats?.borrow ?? 0n}
                  onSuccess={onTxSuccess}
                />
              </div>
              <div className="xl:col-span-5 space-y-8 w-full">
                <div className="card p-8 sm:p-10 space-y-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/30 rounded-[2rem] sm:rounded-[2.5rem]">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sacco-accent/20 flex items-center justify-center shadow-inner">
                      <Info className="w-6 h-6 text-sacco-accent" />
                    </div>
                    Borrowing guide
                  </h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 font-black text-sacco-accent text-sm border border-white/5 shadow-inner">1</div>
                      <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">
                        Borrow up to <span className="text-white font-bold">200%</span> of your total collateral (deposit).
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 font-black text-sacco-accent text-sm border border-white/5 shadow-inner">2</div>
                      <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">
                        Repay anytime. Interest is accrued per block and added to your balance.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 font-black text-sacco-accent text-sm border border-white/5 shadow-inner">3</div>
                      <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">
                        Withdrawals are blocked if they would put your borrow over the <span className="text-white font-bold">2× limit</span>.
                      </p>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="card border-red-200 bg-red-50 p-6 flex items-start gap-4 text-red-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-red-100/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 shadow-sm">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 overflow-hidden w-full">
                      <h4 className="font-black text-xs tracking-normal">Sync error</h4>
                      <p className="text-sm font-bold leading-relaxed break-all">{error}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
  loading
}: {
  label: string;
  value: string;
  icon: any;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "card relative overflow-hidden group transition-all duration-500 p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] w-full",
        highlight 
          ? "bg-sacco text-white border-none shadow-2xl shadow-sacco/30" 
          : "hover:border-sacco/30 hover:shadow-xl hover:shadow-slate-200/50 bg-white",
        loading && "opacity-70"
      )}
    >
      <div className="flex justify-between items-start mb-8">
        <div className={cn(
          "p-3.5 sm:p-4 rounded-2xl transition-all duration-500 shadow-sm",
          highlight ? "bg-white/20 rotate-12" : "bg-slate-50 group-hover:bg-sacco-light group-hover:rotate-12"
        )}>
          <Icon className={cn("w-6 h-6 sm:w-7 sm:h-7", highlight ? "text-white" : "text-slate-400 group-hover:text-sacco")} />
        </div>
      </div>
      <div className={cn(
        "font-black tracking-normal text-[9px] sm:text-[10px] md:text-xs mb-2",
        highlight ? "text-white/70" : "text-slate-400"
      )}>
        {label}
      </div>
      <div className={cn(
        "text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter transition-all duration-500 break-all sm:break-normal",
        highlight ? "text-white group-hover:scale-105 origin-left" : "text-slate-900 group-hover:text-sacco"
      )}>
        {value}
      </div>
      {loading && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px] z-10">
          <RefreshCw className="w-8 h-8 text-sacco animate-spin" />
        </div>
      )}
    </div>
  );
}

function fmt(v: bigint): string {
  // USDC on Stellar has 7 decimals
  const SCALE = 10_000_000n;
  const whole = v / SCALE;
  const frac = v % SCALE;
  const fracStr = (Number(frac) / Number(SCALE))
    .toFixed(2)
    .slice(2);
  return `${whole.toString()}.${fracStr}`;
}
