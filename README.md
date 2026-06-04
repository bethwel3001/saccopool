# SaccoChain — On‑Chain Micro‑Lending for African SACCOs

SaccoChain is a transparent, on‑chain micro‑lending pool for African Savings and Credit
Cooperatives (SACCOs), built on **Stellar Soroban**. Members deposit testnet USDC into a
shared lending pool, earn yield on idle capital, and can borrow up to **2× their deposit**
in the same pool — all enforced by smart contracts, with every deposit, loan and repayment
publicly auditable on the Stellar ledger.

> Built for the **Stellar GIVE Impact Bootcamp 2026** by GDG UTAMU.

## Why

Informal SACCOs serve millions across East Africa but suffer from opaque bookkeeping, single
points of failure (the treasurer), and zero access to outside capital. SaccoChain replaces
the cash box with a single audited contract any member can inspect from their phone.

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
pool/             SaccoPool Soroban lending contract
backstop/         Pool backstop module
pool-factory/     Factory contract for deploying pools
emitter/          Emissions module
mocks/            Test mocks
test-suites/      Integration tests
frontend/         SaccoChain Next.js + Tailwind UI (Freighter + Soroban)
CONTRACT_ADDRESSES.md   Deployed testnet addresses
VIDEO_SCRIPT.md   2‑minute pitch script
```

The core on‑chain addition is the `get_member_stats(address, asset) -> MemberStats` view
returning `{ deposit, borrow, available_to_borrow }`, which powers the per‑member
dashboard.

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
cargo test      # runs the full test suite
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

## 2‑minute pitch script

See [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md).

## Team

GDG UTAMU — Stellar GIVE Impact Bootcamp 2026.

## License

See [LICENSE](LICENSE).
