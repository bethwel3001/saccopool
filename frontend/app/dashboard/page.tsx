"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { ActionPanel } from "@/components/ActionPanel";
import {
  getMemberStats,
  MemberStats,
  watchWallet,
} from "@/lib/sacco";

export default function DashboardPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => watchWallet(setAddress), []);

  useEffect(() => {
    if (!address) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setError(null);
    getMemberStats(address)
      .then((s) => !cancelled && setStats(s))
      .catch((e) => !cancelled && setError(e.message ?? String(e)));
    return () => {
      cancelled = true;
    };
  }, [address, refreshTick]);

  const onTxSuccess = () => setRefreshTick((t) => t + 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-sacco-dark">My SaccoChain</h1>
          <p className="text-slate-600 text-sm">
            Your personal view of the on-chain SACCO pool.
          </p>
        </div>
        <ConnectButton />
      </div>

      {!address && (
        <div className="card text-center">
          <p className="text-slate-700">
            Connect your Freighter wallet to view your deposit, borrow, and
            available credit.
          </p>
        </div>
      )}

      {address && (
        <>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>Testnet demo mode.</strong> The deployed SaccoPool
            contract (
            <code className="font-mono">
              CBY2WIY6…W7DDF
            </code>
            ) is live on Stellar testnet and the SaccoChain{" "}
            <code>get_member_stats</code> view is callable on‑chain. A USDC
            reserve has not been queued on this demo pool, so positions read as
            zero until reserves are funded.
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="My deposit"
              value={stats ? `${fmt(stats.deposit)} USDC` : "—"}
            />
            <StatCard
              label="My borrow"
              value={stats ? `${fmt(stats.borrow)} USDC` : "—"}
            />
            <StatCard
              label="Available to borrow"
              value={
                stats ? `${fmt(stats.availableToBorrow)} USDC` : "—"
              }
              highlight
            />
          </section>

          <ActionPanel
            address={address}
            availableToBorrow={stats?.availableToBorrow ?? 0n}
            currentBorrow={stats?.borrow ?? 0n}
            onSuccess={onTxSuccess}
          />

          {error && (
            <div className="card border-red-200 bg-red-50 text-sm text-red-800">
              Could not load member stats: {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card ${
        highlight ? "border-sacco-accent ring-2 ring-sacco-accent/30" : ""
      }`}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
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
