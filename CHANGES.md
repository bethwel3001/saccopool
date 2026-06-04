# Changes from Blend Protocol (blend-capital/blend-contracts-v2)

This repository is a fork of **Blend Protocol v2** adapted into **SaccoChain**, an on‑chain
micro-lending product for African SACCOs (Savings and Credit Cooperatives), built on Stellar
Soroban.

All original Blend code and tests are preserved so the protocol still builds and passes its
existing test suite. Adaptations are layered on top additively so the underlying lending
primitive remains auditable against upstream Blend.

---

## Smart Contract Changes

### Additive — `pool/src/contract.rs`

- **New view function `get_member_stats(address, asset)`** returning a new `MemberStats`
  struct: `{ deposit, borrow, available_to_borrow }`, all in the underlying asset's units.
  - `deposit` = collateral + non‑collateral supply for the member on that reserve, expressed
    in underlying asset using the current `b_rate`.
  - `borrow` = liability share balance for the member on that reserve, expressed in
    underlying asset using the current `d_rate`.
  - `available_to_borrow` = `max(0, 2 * deposit - borrow)` — the SaccoChain product cap
    (a member may borrow at most 2x their current deposit in the same asset). This is on top
    of Blend's standard health‑factor checks at borrow time, not a replacement.
- **New public type `MemberStats`** exported via `pub use contract::*` from `pool/src/lib.rs`.

### Product‑level configuration (off‑chain / deployment)

The SaccoChain deployment uses the unmodified Blend pool engine with the following
deployment‑time parameters, recorded in `CONTRACT_ADDRESSES.md`:

- **Pool name:** `"SaccoPool"` (passed to the constructor as the human‑readable `name`).
- **Accepted asset:** Stellar testnet USDC only. No other reserves are queued.
- **Target APR:** ~10% APR shaped via the reserve's interest‑rate config
  (`r_base`/`r_one`/`r_two`/`r_three`/utilization targets) on the SaccoPool USDC reserve.
- **Borrow cap:** Enforced at the product layer by `get_member_stats` (2x deposit). The
  frontend reads `available_to_borrow` and refuses to construct a borrow request that
  exceeds it; the on‑chain health‑factor check remains the ultimate guard.

Renaming the `PoolContract` Rust struct everywhere would have rewritten ~30 test files
without changing on‑chain behaviour. We instead deploy the contract under the
human‑readable name `SaccoPool` (constructor argument), which is what wallets and explorers
display to users.

## Frontend Changes

- **New `frontend/` Next.js app** built from scratch. The original Blend UI is not used.
- Pages: `/` (landing + connect + pool stats), `/dashboard` (deposit / borrow / repay /
  withdraw).
- Wallet: **Freighter** via `@stellar/freighter-api`.
- Transactions: built and signed with `@stellar/stellar-sdk` against Soroban testnet RPC.
- Every action surfaces the resulting tx hash with a link to Stellar Expert.
- Designed so a non‑technical user can read the dashboard in under 30 seconds.

## Removed Components

Nothing from the Blend protocol code was removed. The fork is purely additive at the
contract level so the codebase remains auditable against upstream Blend. The frontend is
new and does not reuse any prior UI.

## Files Touched

- `pool/src/contract.rs` — added `MemberStats` + `get_member_stats`.
- `CHANGES.md` — this file.
- `README.md` — replaced with SaccoChain product README (original Blend README preserved in
  git history).
- `CONTRACT_ADDRESSES.md` — new, holds testnet deployment addresses.
- `VIDEO_SCRIPT.md` — new, 2‑minute pitch script.
- `frontend/**` — new Next.js + Tailwind frontend.
