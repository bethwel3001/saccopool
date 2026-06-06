"use client";

import { useState } from "react";
import {
  RequestType,
  submitRequest,
  usdcToAtomic,
} from "@/lib/sacco";
import { explorerTx } from "@/lib/config";
import { isSimulatorMode } from "@/lib/simulator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RotateCcw, 
  Wallet, 
  Loader2, 
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "deposit" | "borrow" | "repay" | "withdraw";

const TAB_TO_REQUEST: Record<Tab, RequestType> = {
  deposit: "supply_collateral",
  borrow: "borrow",
  repay: "repay",
  withdraw: "withdraw_collateral",
};

const TAB_DETAILS: Record<Tab, { icon: any; color: string; description: string }> = {
  deposit: {
    icon: ArrowDownCircle,
    color: "text-emerald-600",
    description: "Deposits become collateral and start earning yield immediately."
  },
  borrow: {
    icon: ArrowUpCircle,
    color: "text-blue-600",
    description: "Borrow is capped at 2× your current deposit (SaccoChain rule)."
  },
  repay: {
    icon: RotateCcw,
    color: "text-amber-600",
    description: "Repay any portion of your outstanding loan."
  },
  withdraw: {
    icon: Wallet,
    color: "text-purple-600",
    description: "Withdraw idle collateral. The on-chain health check will block unsafe withdrawals."
  },
};

export function ActionPanel({
  address,
  availableToBorrow,
  currentBorrow,
  onSuccess,
}: {
  address: string;
  availableToBorrow: bigint;
  currentBorrow: bigint;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<Tab>("deposit");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const atomic = usdcToAtomic(amount);
    if (atomic <= 0n) {
      toast.error("Enter an amount greater than 0.");
      return;
    }
    if (tab === "borrow" && atomic > availableToBorrow) {
      toast.error(
        "SaccoChain limits borrow to 2× your deposit. Lower the amount or deposit more first."
      );
      return;
    }
    if (tab === "repay" && atomic > currentBorrow) {
      toast.error("Repay amount cannot exceed your current borrow.");
      return;
    }

    setBusy(true);
    const loadingToast = toast.loading(`Processing ${tab}...`);
    
    try {
      const hash = await submitRequest(address, TAB_TO_REQUEST[tab], atomic);
      toast.success(`${tab.charAt(0).toUpperCase() + tab.slice(1)} successful!`, {
        id: loadingToast,
        description: isSimulatorMode() 
          ? "Simulated locally." 
          : "Transaction confirmed on Stellar.",
        action: !isSimulatorMode() ? {
          label: "View Transaction",
          onClick: () => window.open(explorerTx(hash), "_blank")
        } : undefined
      });
      setAmount("");
      onSuccess();
    } catch (e: any) {
      toast.error(e?.message ?? String(e), { id: loadingToast });
    } finally {
      setBusy(false);
    }
  };

  const activeDetails = TAB_DETAILS[tab];

  return (
    <div className="card overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40 p-4 sm:p-8 rounded-[2rem]">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap p-1.5 gap-1.5 bg-slate-100 rounded-2xl mb-8">
        {(["deposit", "borrow", "repay", "withdraw"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setAmount("");
            }}
            className={cn(
              "px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all duration-200 flex items-center justify-center gap-2 sm:flex-1",
              tab === t
                ? "bg-white text-sacco shadow-md"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm sm:text-base font-bold text-slate-700 flex items-center gap-2">
                <activeDetails.icon className={cn("w-5 h-5", activeDetails.color)} />
                {tab.charAt(0).toUpperCase() + tab.slice(1)} amount
              </label>
              <span className="text-[10px] sm:text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg lowercase tracking-normal">
                usdc
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-sacco/10 focus:border-sacco transition-all text-xl font-bold placeholder:text-slate-300"
                />
              </div>
              <button
                className="btn-primary px-10 py-4 sm:py-2 min-w-[140px] shadow-lg shadow-sacco/20 rounded-2xl text-lg"
                onClick={submit}
                disabled={busy || !amount}
                type="button"
              >
                {busy ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="capitalize">{tab}</span>
                )}
              </button>
            </div>
            
            <div className="flex items-start gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 mt-2">
              <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {activeDetails.description}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
