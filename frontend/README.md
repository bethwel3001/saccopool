# SaccoChain Frontend

Next.js 14 (App Router) + Tailwind UI for the SaccoChain SaccoPool. Talks to a deployed
Soroban pool on Stellar testnet via `@stellar/stellar-sdk`, with Freighter for signing.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill NEXT_PUBLIC_POOL_CONTRACT_ID with your deployed SaccoPool id
npm run dev
```

Open <http://localhost:3000>.

## Deploy

Push this folder to Vercel or Netlify. Set the same `NEXT_PUBLIC_*` env vars in the host's
dashboard. No backend is required — the UI talks directly to Soroban RPC.

## What it does

- `/` — landing page with pool stats (total supply / total borrow / APR) and a Freighter
  connect button.
- `/dashboard` — per-member view backed by the on-chain
  `get_member_stats(address, asset)` view, plus deposit / borrow / repay / withdraw
  actions that submit `Request` structs to the pool's `submit` entrypoint.

Every successful action surfaces the tx hash with a link to Stellar Expert.
