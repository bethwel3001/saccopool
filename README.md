# SaccoChain — On‑Chain Micro‑Lending for African SACCOs

> A fork of [Blend Protocol v2](https://github.com/blend-capital/blend-contracts-v2) adapted
> for SACCO (Savings and Credit Cooperative) micro‑lending on Stellar Soroban.
> Built for the **Stellar GIVE Impact Bootcamp 2026** by GDG UTAMU.

The original Blend README is preserved at [README.blend.md](README.blend.md).

## What it does

SaccoChain puts informal African savings groups (SACCOs) on‑chain. Members deposit testnet
USDC into a shared Soroban lending pool, earn yield on idle capital, and can borrow up to
**2× their deposit** in the same pool — all enforced by a smart contract, with every
deposit, loan and repayment publicly auditable on the Stellar ledger.

It replaces the opaque treasurer‑managed cash box of a traditional SACCO with a single
audited contract any member can inspect from their phone.

## Who it's for

SACCO members, small‑business owners, market vendors and unbanked individuals in Uganda
and East Africa who today rely on village savings groups but have no transparency, no
credit history, and no path into formal finance.

## How it works

1. A SACCO treasurer deploys (or joins) a SaccoPool on Stellar testnet.
2. Members install Freighter wallet (mobile + desktop), get testnet USDC, and connect.
3. Each member deposits USDC into the pool — this becomes their collateral.
4. Any member can borrow up to **2× their own deposit** in USDC, subject to the pool's
   on‑chain health checks.
5. Borrowers repay with interest (target ~10% APR via the reserve's rate config); the
   yield flows back to depositing members proportionally.

## Stellar features used

- **Soroban smart contracts** — the SaccoPool lending engine (`pool/`, `backstop/`,
  `pool-factory/`).
- **Stellar testnet USDC** — the single accepted reserve asset.
- **Freighter wallet** — user auth + transaction signing in the browser.
- **Soroban RPC** — frontend reads pool state and submits signed transactions.
- **Stellar Expert** — every action in the UI deep‑links to the resulting tx on testnet
  explorer.

## Repository layout

```
pool/             SaccoPool Soroban contract (Blend pool + SaccoChain additions)
backstop/         Pool backstop module (unchanged from Blend)
pool-factory/     Factory contract for deploying pools
emitter/          BLND emissions module
mocks/            Test mocks
test-suites/      Integration tests
frontend/         SaccoChain Next.js + Tailwind UI (Freighter + Soroban)
CHANGES.md        Every modification from upstream Blend
CONTRACT_ADDRESSES.md   Deployed testnet addresses
VIDEO_SCRIPT.md   2‑minute pitch script
```

The on‑chain product addition is documented in [CHANGES.md](CHANGES.md). At a glance: one
new view function `get_member_stats(address, asset) -> MemberStats` returning
`{ deposit, borrow, available_to_borrow }`.

## How to run it locally

### Prerequisites

- Rust toolchain pinned by [rust-toolchain.toml](rust-toolchain.toml)
- `wasm32-unknown-unknown` target: `rustup target add wasm32-unknown-unknown`
- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup):
  `cargo install --locked stellar-cli --features opt`
- Node.js 18+ and npm (for the frontend)
- [Freighter wallet](https://www.freighter.app/) browser extension

### Build the contracts

```bash
make build      # builds all Soroban contracts to target/wasm32-unknown-unknown/release
cargo test      # runs the full Blend + SaccoChain test suite
```

### Deploy to Stellar testnet

```bash
# 1. Configure testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# 2. Fund a deployer key
stellar keys generate deployer
stellar keys fund deployer --network testnet

# 3. Deploy the pool wasm
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/pool.wasm \
  --source deployer \
  --network testnet

# 4. Initialize as "SaccoPool" via constructor args
#    (admin, "SaccoPool", oracle, bstop_rate, max_positions, min_collateral,
#     backstop_id, blnd_id)
# 5. Queue + set the testnet USDC reserve via queue_set_reserve / set_reserve.
```

Record the resulting contract IDs into [CONTRACT_ADDRESSES.md](CONTRACT_ADDRESSES.md).

### Run the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local      # fill in your deployed pool + USDC contract ids
npm run dev                           # http://localhost:3000
```

To deploy live, push the `frontend/` folder to Vercel or Netlify and set the same env vars
in the hosting provider's dashboard.

## Contract Addresses (Testnet)

See [CONTRACT_ADDRESSES.md](CONTRACT_ADDRESSES.md).

## What was changed from Blend Protocol

See [CHANGES.md](CHANGES.md). Summary: one additive on‑chain view function
(`get_member_stats`) plus a brand‑new frontend; the Blend lending engine itself is
unchanged so the upstream test suite still passes.

## 2‑minute pitch script

See [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md).

## Team

GDG UTAMU — Stellar GIVE Impact Bootcamp 2026, Week 5.

## License

Inherits the upstream Blend Protocol license — see [LICENSE](LICENSE).
