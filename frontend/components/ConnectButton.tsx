"use client";

import { useEffect, useState } from "react";
import { connectWallet, watchWallet } from "@/lib/sacco";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ConnectButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualDisconnect, setManualDisconnect] = useState(false);

  useEffect(() => {
    return watchWallet((addr) => {
      if (!manualDisconnect) {
        setAddress(addr);
      }
    });
  }, [manualDisconnect]);

  const onConnect = async () => {
    setBusy(true);
    try {
      const a = await connectWallet();
      setAddress(a);
      setManualDisconnect(false);
      toast.success("Wallet connected successfully!");
    } catch (e: any) {
      toast.error(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = () => {
    setAddress(null);
    setManualDisconnect(true);
    toast.success("Wallet disconnected");
  };

  if (address) {
    return (
      <div className="flex items-center gap-2 p-1 pl-4 rounded-xl bg-sacco-light border border-sacco/20">
        <span className="text-sm font-mono text-sacco-dark font-medium">
          {address.slice(0, 5)}…{address.slice(-5)}
        </span>
        <div className="w-px h-4 bg-sacco/20 mx-1" />
        <button
          onClick={onDisconnect}
          className="p-2 text-sacco-dark hover:bg-sacco/10 rounded-lg transition-colors group"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-md shadow-sacco/20 hover:shadow-lg hover:shadow-sacco/30 active:scale-95 transition-all duration-200"
      onClick={onConnect}
      disabled={busy}
      type="button"
    >
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {busy ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
