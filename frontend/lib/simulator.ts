"use client";

// Local "simulator" backing store for SaccoChain.
//
// When the on-chain SaccoPool reserve for USDC hasn't been activated yet (which
// requires the surrounding backstop + LP + oracle infrastructure to be fully
// wired up on testnet), the dashboard runs against this in-browser simulator
// instead. Every member gets their own per-address ledger in localStorage so
// the demo flow (deposit → borrow → repay → withdraw) feels real, with the
// same 2× borrow cap the on-chain contract enforces.
//
// The on-chain `get_member_stats` view is still demonstrated separately: the
// real contract IS deployed and callable, the simulator only stands in for the
// reserve-funded write path.

import { config } from "./config";

const SCALAR_7 = 10_000_000n;

export type SimMemberStats = {
  deposit: bigint;
  borrow: bigint;
  availableToBorrow: bigint;
};

type SimState = {
  deposit: string; // bigint serialised as decimal
  borrow: string;
};

const POOL_KEY = "saccochain:sim:pool";

function memberKey(address: string): string {
  return `saccochain:sim:member:${address}`;
}

function readMember(address: string): SimState {
  if (typeof window === "undefined") return { deposit: "0", borrow: "0" };
  try {
    const raw = window.localStorage.getItem(memberKey(address));
    if (!raw) return { deposit: "0", borrow: "0" };
    const parsed = JSON.parse(raw) as Partial<SimState>;
    return {
      deposit: parsed.deposit ?? "0",
      borrow: parsed.borrow ?? "0",
    };
  } catch {
    return { deposit: "0", borrow: "0" };
  }
}

function writeMember(address: string, state: SimState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(memberKey(address), JSON.stringify(state));
}

type PoolAgg = { totalDeposit: string; totalBorrow: string };

function readPool(): PoolAgg {
  if (typeof window === "undefined")
    return { totalDeposit: "0", totalBorrow: "0" };
  try {
    const raw = window.localStorage.getItem(POOL_KEY);
    if (!raw) return { totalDeposit: "0", totalBorrow: "0" };
    const parsed = JSON.parse(raw) as Partial<PoolAgg>;
    return {
      totalDeposit: parsed.totalDeposit ?? "0",
      totalBorrow: parsed.totalBorrow ?? "0",
    };
  } catch {
    return { totalDeposit: "0", totalBorrow: "0" };
  }
}

function writePool(p: PoolAgg) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(POOL_KEY, JSON.stringify(p));
}

function bumpPool(deltaDeposit: bigint, deltaBorrow: bigint) {
  const cur = readPool();
  const nd = BigInt(cur.totalDeposit) + deltaDeposit;
  const nb = BigInt(cur.totalBorrow) + deltaBorrow;
  writePool({
    totalDeposit: (nd < 0n ? 0n : nd).toString(),
    totalBorrow: (nb < 0n ? 0n : nb).toString(),
  });
}

export function getSimMemberStats(address: string): SimMemberStats {
  const m = readMember(address);
  const deposit = BigInt(m.deposit);
  const borrow = BigInt(m.borrow);
  const maxBorrow = deposit * 2n;
  const availableToBorrow = maxBorrow > borrow ? maxBorrow - borrow : 0n;
  return { deposit, borrow, availableToBorrow };
}

export function getSimPoolStats(): { totalSupplyUsdc: number; totalBorrowUsdc: number } {
  const p = readPool();
  const toNum = (v: bigint) => Number(v / SCALAR_7) + Number(v % SCALAR_7) / Number(SCALAR_7);
  return {
    totalSupplyUsdc: toNum(BigInt(p.totalDeposit)),
    totalBorrowUsdc: toNum(BigInt(p.totalBorrow)),
  };
}

export type SimAction = "deposit" | "borrow" | "repay" | "withdraw";

export function applySimAction(
  address: string,
  action: SimAction,
  amount: bigint
): SimMemberStats {
  if (amount <= 0n) throw new Error("Amount must be greater than 0.");
  const m = readMember(address);
  let deposit = BigInt(m.deposit);
  let borrow = BigInt(m.borrow);

  switch (action) {
    case "deposit":
      deposit += amount;
      bumpPool(amount, 0n);
      break;
    case "withdraw": {
      if (amount > deposit)
        throw new Error("Cannot withdraw more than your deposit.");
      // health check: borrow must remain ≤ 2× remaining deposit
      const newDep = deposit - amount;
      if (borrow > newDep * 2n)
        throw new Error(
          "Withdrawal would breach the 2× borrow limit. Repay some of your loan first."
        );
      deposit = newDep;
      bumpPool(-amount, 0n);
      break;
    }
    case "borrow": {
      const maxBorrow = deposit * 2n;
      if (borrow + amount > maxBorrow)
        throw new Error(
          "Borrow capped at 2× your deposit (SaccoChain rule)."
        );
      borrow += amount;
      bumpPool(0n, amount);
      break;
    }
    case "repay":
      if (amount > borrow)
        throw new Error("Cannot repay more than your current borrow.");
      borrow -= amount;
      bumpPool(0n, -amount);
      break;
  }

  writeMember(address, {
    deposit: deposit.toString(),
    borrow: borrow.toString(),
  });

  const maxBorrow = deposit * 2n;
  const availableToBorrow = maxBorrow > borrow ? maxBorrow - borrow : 0n;
  return { deposit, borrow, availableToBorrow };
}

/**
 * Produces a synthetic 64-char hex "tx hash" derived from the inputs so the
 * confirmation UI has something to render. We do NOT link to Stellar Expert in
 * simulator mode because the hash isn't a real on-chain tx.
 */
export function simTxHash(address: string, action: SimAction, amount: bigint): string {
  const seed = `${address}|${action}|${amount}|${Date.now()}|${Math.random()}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  const part = (n: number) =>
    (n >>> 0).toString(16).padStart(8, "0");
  return (
    part(h1) + part(h2) + part(h1 ^ h2) + part(Math.imul(h1, h2)) +
    part(h1 + h2) + part(h1 - h2) + part(h2 - h1) + part(h1 | h2)
  );
}

export function isSimulatorMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_SIMULATOR_MODE === "true" ||
    !config.poolContractId.startsWith("C")
  );
}
