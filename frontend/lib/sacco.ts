"use client";

import {
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  BASE_FEE,
  Account,
} from "@stellar/stellar-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";
import freighterApi from "@stellar/freighter-api";
import { config, requirePoolId } from "./config";
import {
  applySimAction,
  getSimMemberStats,
  getSimPoolStats,
  isSimulatorMode,
  simTxHash,
  SimAction,
} from "./simulator";

// stellar-sdk v12 exposes Soroban RPC as `SorobanRpc`; in newer versions it's `rpc`.
// We resolve at runtime to stay compatible.
const RpcNs: any = (StellarSdk as any).SorobanRpc ?? (StellarSdk as any).rpc;
const server = new RpcNs.Server(config.rpcUrl, { allowHttp: true });

export type MemberStats = {
  deposit: bigint;
  borrow: bigint;
  availableToBorrow: bigint;
};

export type PoolStats = {
  totalSupplyUsdc: number;
  totalBorrowUsdc: number;
};

// --- Wallet helpers -------------------------------------------------------
//
// Freighter API v3 returns `{ isConnected, error }`, `{ isAllowed, error }`,
// `{ address, error }` etc. — never raw values. Older versions returned the raw
// value. We normalise both shapes so the UI works either way.

function unwrap<T>(r: any, key: string): T | null {
  if (r == null) return null;
  if (typeof r === "object") {
    if (r.error) return null;
    if (key in r) return r[key] as T;
  }
  return r as T;
}

async function readAddress(): Promise<string | null> {
  const fapi: any = freighterApi as any;
  try {
    if (typeof fapi.getAddress === "function") {
      const r = await fapi.getAddress();
      const a = unwrap<string>(r, "address");
      if (a) return a;
    }
    if (typeof fapi.getPublicKey === "function") {
      const r = await fapi.getPublicKey();
      const a = unwrap<string>(r, "publicKey");
      if (a) return a;
    }
  } catch {
    /* fallthrough */
  }
  return null;
}

async function freighterReady(): Promise<{ connected: boolean; allowed: boolean }> {
  const fapi: any = freighterApi as any;
  let connected = false;
  let allowed = false;
  try {
    if (typeof fapi.isConnected === "function") {
      const r = await fapi.isConnected();
      connected = !!unwrap<boolean>(r, "isConnected");
    }
  } catch {}
  try {
    if (typeof fapi.isAllowed === "function") {
      const r = await fapi.isAllowed();
      allowed = !!unwrap<boolean>(r, "isAllowed");
    }
  } catch {}
  return { connected, allowed };
}

export function watchWallet(cb: (addr: string | null) => void): () => void {
  let cancelled = false;
  const tick = async () => {
    const { connected, allowed } = await freighterReady();
    if (!connected || !allowed) {
      if (!cancelled) cb(null);
      return;
    }
    const addr = await readAddress();
    if (!cancelled) cb(addr);
  };
  tick();
  const id = window.setInterval(tick, 4000);
  return () => {
    cancelled = true;
    window.clearInterval(id);
  };
}

export async function connectWallet(): Promise<string> {
  const fapi: any = freighterApi as any;

  const { connected } = await freighterReady();
  if (!connected) {
    throw new Error(
      "Freighter not detected. Install the Freighter extension and reload the page."
    );
  }

  // Trigger the permission popup. Different API versions expose different methods.
  let accessRes: any = null;
  if (typeof fapi.requestAccess === "function") {
    accessRes = await fapi.requestAccess();
  } else if (typeof fapi.setAllowed === "function") {
    accessRes = await fapi.setAllowed();
  }
  if (accessRes && typeof accessRes === "object" && accessRes.error) {
    throw new Error(
      typeof accessRes.error === "string"
        ? accessRes.error
        : accessRes.error?.message ?? "Freighter rejected the connection."
    );
  }

  // requestAccess() in v3+ already returns the address.
  const fromAccess = unwrap<string>(accessRes, "address");
  if (fromAccess) return fromAccess;

  const addr = await readAddress();
  if (!addr) {
    throw new Error(
      "Freighter did not return an address. Make sure a Stellar account is selected and the network is set to Testnet."
    );
  }
  return addr;
}

// --- Read calls (simulated, no signing) -----------------------------------

async function simulate(
  fromAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<any> {
  const account = await server.getAccount(fromAddress).catch(() => {
    // Use a dummy account for view simulation if the wallet account isn't on-chain yet.
    return new Account(fromAddress, "0");
  });
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim: any = await server.simulateTransaction(tx);
  if (sim.error) throw new Error(sim.error);
  const retval =
    sim.result?.retval ?? sim.results?.[0]?.xdr
      ? sim.result?.retval ??
        xdr.ScVal.fromXDR(sim.results[0].xdr, "base64")
      : undefined;
  if (!retval) throw new Error("No return value from simulation");
  return scValToNative(retval);
}

export async function getMemberStats(address: string): Promise<MemberStats> {
  if (isSimulatorMode()) {
    return getSimMemberStats(address);
  }
  const poolId = requirePoolId();
  try {
    const result = await simulate(address, poolId, "get_member_stats", [
      new Address(address).toScVal(),
      new Address(config.usdcContractId).toScVal(),
    ]);
    return {
      deposit: BigInt(result.deposit ?? 0),
      borrow: BigInt(result.borrow ?? 0),
      availableToBorrow: BigInt(result.available_to_borrow ?? 0),
    };
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    // When USDC isn't yet queued as a reserve on the pool, Reserve::load traps
    // with Storage::MissingValue / "ResConfig". For the bootcamp demo we treat
    // that as "this member has no position yet" rather than a hard error.
    if (
      msg.includes("MissingValue") ||
      msg.includes("ResConfig") ||
      msg.includes("non-existing value")
    ) {
      return { deposit: 0n, borrow: 0n, availableToBorrow: 0n };
    }
    throw e;
  }
}

export async function getPoolStats(): Promise<PoolStats> {
  if (isSimulatorMode()) {
    return getSimPoolStats();
  }
  const poolId = requirePoolId();
  // Use the USDC contract id as a stand-in source for the simulate "from".
  // Anyone can read; the from address only matters for fees.
  const dummy = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  try {
    const reserve = await simulate(dummy, poolId, "get_reserve", [
      new Address(config.usdcContractId).toScVal(),
    ]);
    const b_supply = BigInt(reserve?.data?.b_supply ?? 0);
    const d_supply = BigInt(reserve?.data?.d_supply ?? 0);
    const b_rate = BigInt(reserve?.data?.b_rate ?? 0);
    const d_rate = BigInt(reserve?.data?.d_rate ?? 0);
    const SCALAR_12 = 1_000_000_000_000n;
    const totalSupply = (b_supply * b_rate) / SCALAR_12;
    const totalBorrow = (d_supply * d_rate) / SCALAR_12;
    const toNum = (v: bigint) => Number(v) / 10_000_000;
    return {
      totalSupplyUsdc: toNum(totalSupply),
      totalBorrowUsdc: toNum(totalBorrow),
    };
  } catch {
    return { totalSupplyUsdc: 0, totalBorrowUsdc: 0 };
  }
}

// --- Write calls: submit Request[] ----------------------------------------

export type RequestType =
  | "supply"
  | "supply_collateral"
  | "withdraw"
  | "withdraw_collateral"
  | "borrow"
  | "repay";

const REQUEST_TYPE_CODES: Record<RequestType, number> = {
  supply: 0,
  withdraw: 1,
  supply_collateral: 2,
  withdraw_collateral: 3,
  borrow: 4,
  repay: 5,
};

const REQUEST_TO_SIM: Partial<Record<RequestType, SimAction>> = {
  supply: "deposit",
  supply_collateral: "deposit",
  withdraw: "withdraw",
  withdraw_collateral: "withdraw",
  borrow: "borrow",
  repay: "repay",
};

function buildRequestScVal(kind: RequestType, asset: string, amount: bigint) {
  // Matches the Soroban `Request` struct in pool/src/pool/actions.rs:
  //   { request_type: u32, address: Address, amount: i128 }
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("address"),
      val: new Address(asset).toScVal(),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("amount"),
      val: nativeToScVal(amount, { type: "i128" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("request_type"),
      val: xdr.ScVal.scvU32(REQUEST_TYPE_CODES[kind]),
    }),
  ]);
}

export async function submitRequest(
  from: string,
  kind: RequestType,
  amountAtomic: bigint
): Promise<string> {
  if (isSimulatorMode()) {
    const action = REQUEST_TO_SIM[kind];
    if (!action) throw new Error(`Unsupported action in simulator: ${kind}`);
    applySimAction(from, action, amountAtomic);
    // Yield to the event loop so the UI animates the "Submitting…" state.
    await new Promise((r) => setTimeout(r, 400));
    return simTxHash(from, action, amountAtomic);
  }
  const poolId = requirePoolId();
  const account = await server.getAccount(from);
  const contract = new Contract(poolId);

  const fromScVal = new Address(from).toScVal();
  const requestVec = xdr.ScVal.scvVec([
    buildRequestScVal(kind, config.usdcContractId, amountAtomic),
  ]);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call("submit", fromScVal, fromScVal, fromScVal, requestVec)
    )
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);

  const fapi: any = freighterApi as any;
  const signed = await fapi.signTransaction(prepared.toXDR(), {
    networkPassphrase: config.networkPassphrase,
    address: from,
  });
  const signedXdr =
    typeof signed === "string" ? signed : signed?.signedTxXdr ?? signed;
  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  );

  const sendResp: any = await server.sendTransaction(signedTx);
  if (sendResp.status === "ERROR") {
    throw new Error(
      `Submit failed: ${JSON.stringify(sendResp.errorResult ?? sendResp)}`
    );
  }
  let getResp: any = await server.getTransaction(sendResp.hash);
  const deadline = Date.now() + 30_000;
  while (getResp.status === "NOT_FOUND" && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500));
    getResp = await server.getTransaction(sendResp.hash);
  }
  if (getResp.status !== "SUCCESS") {
    throw new Error(`Transaction status: ${getResp.status}`);
  }
  return sendResp.hash;
}

// USDC on Stellar has 7 decimals
export function usdcToAtomic(human: string): bigint {
  const trimmed = human.trim();
  if (!trimmed) return 0n;
  const [w, f = ""] = trimmed.split(".");
  const frac = (f + "0000000").slice(0, 7);
  return BigInt(w || "0") * 10_000_000n + BigInt(frac || "0");
}
