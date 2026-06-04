"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { getPoolStats, PoolStats } from "@/lib/sacco";
import { config } from "@/lib/config";

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

  return (
    <div className="space-y-12">
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-sacco-dark leading-tight">
          Transparent savings. Trustless lending.
          <br />
          Built for African SACCOs.
        </h1>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto">
          SaccoChain puts your savings group on Stellar. Deposit USDC, earn
          yield, and borrow up to 2× your contribution — every transaction
          visible to every member, every time.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ConnectButton />
          <Link href="/dashboard" className="btn-secondary">
            Open dashboard →
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="stat-label">Total pool size</div>
          <div className="stat-value">
            {stats ? `${stats.totalSupplyUsdc.toLocaleString()} USDC` : "—"}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Total borrowed</div>
          <div className="stat-value">
            {stats ? `${stats.totalBorrowUsdc.toLocaleString()} USDC` : "—"}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Target APR</div>
          <div className="stat-value">{config.targetApr}%</div>
        </div>
      </section>

      {error && (
        <div className="card border-red-200 bg-red-50 text-sm text-red-800">
          Pool stats unavailable: {error}. Check that the SaccoPool contract id
          in <code>.env.local</code> is correct and the testnet RPC is
          reachable.
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Step
          n={1}
          title="Connect Freighter"
          body="Install the Freighter wallet, switch it to Stellar testnet, and connect."
        />
        <Step
          n={2}
          title="Deposit USDC"
          body="Deposit any amount of testnet USDC. You start earning yield immediately."
        />
        <Step
          n={3}
          title="Borrow up to 2×"
          body="Borrow up to twice your deposit from the same pool. Repay any time."
        />
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="card">
      <div className="w-8 h-8 rounded-full bg-sacco text-white flex items-center justify-center font-bold mb-3">
        {n}
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  );
}
