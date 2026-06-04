"use client";

import { useEffect, useState } from "react";
import { connectWallet, watchWallet } from "@/lib/sacco";

export function ConnectButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => watchWallet(setAddress), []);

  const onClick = async () => {
    setBusy(true);
    setErr(null);
    try {
      const a = await connectWallet();
      setAddress(a);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  if (address) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-sacco-light border border-sacco/30 text-sm font-mono">
        <span className="w-2 h-2 rounded-full bg-sacco" />
        {address.slice(0, 5)}…{address.slice(-5)}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="btn-primary"
        onClick={onClick}
        disabled={busy}
        type="button"
      >
        {busy ? "Connecting…" : "Connect Freighter"}
      </button>
      {err && <span className="text-xs text-red-600 max-w-xs">{err}</span>}
    </div>
  );
}
