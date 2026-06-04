"use client";

import { useState } from "react";
import {
  RequestType,
  submitRequest,
  usdcToAtomic,
} from "@/lib/sacco";
import { explorerTx } from "@/lib/config";

type Tab = "deposit" | "borrow" | "repay" | "withdraw";

const TAB_TO_REQUEST: Record<Tab, RequestType> = {
  deposit: "supply_collateral",
  borrow: "borrow",
  repay: "repay",
  withdraw: "withdraw_collateral",
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
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setTxHash(null);
    const atomic = usdcToAtomic(amount);
    if (atomic <= 0n) {
      setError("Enter an amount greater than 0.");
      return;
    }
    if (tab === "borrow" && atomic > availableToBorrow) {
      setError(
        "SaccoChain limits borrow to 2× your deposit. Lower the amount or deposit more first."
      );
      return;
    }
    if (tab === "repay" && atomic > currentBorrow) {
      setError("Repay amount cannot exceed your current borrow.");
      return;
    }
    setBusy(true);
    try {
      const hash = await submitRequest(address, TAB_TO_REQUEST[tab], atomic);
      setTxHash(hash);
      setAmount("");
      onSuccess();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["deposit", "borrow", "repay", "withdraw"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError(null);
              setTxHash(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-sacco text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-600">Amount (USDC)</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sacco"
          />
          <button
            className="btn-primary capitalize"
            onClick={submit}
            disabled={busy}
            type="button"
          >
            {busy ? "Submitting…" : tab}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {tab === "borrow"
            ? "Borrow is capped at 2× your current deposit (SaccoChain rule)."
            : tab === "deposit"
            ? "Deposits become collateral and start earning yield immediately."
            : tab === "repay"
            ? "Repay any portion of your outstanding loan."
            : "Withdraw idle collateral. The on-chain health check will block unsafe withdrawals."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {txHash && (
        <div className="rounded-xl border border-sacco/30 bg-sacco-light px-4 py-3 text-sm">
          ✅ Transaction confirmed.{" "}
          <a
            className="font-medium underline"
            href={explorerTx(txHash)}
            target="_blank"
            rel="noreferrer"
          >
            View on Stellar Expert ↗
          </a>
        </div>
      )}
    </div>
  );
}
