# 🤖 Agent Instructions — Stellar GIVE Impact Bootcamp 2026 (Week 5)

## Overview

You are completing a bootcamp project on behalf of the team. The project is built on top of the **cloned Blend Protocol** — a lending pool protocol built with Soroban smart contracts on the Stellar network. Your job is to adapt it into a locally grounded, Africa-focused micro-lending product and deliver all submission requirements listed below.

Read every section carefully before writing a single line of code.

---

## 🎯 Project Concept

**Product name:** SaccoChain (or propose a better name if you think of one)

**Problem:** In Uganda and East Africa, millions of people rely on informal savings groups called SACCOs (Savings and Credit Cooperative Organizations) and village savings groups. These groups lend money to members but suffer from:
- Lack of transparency (funds mismanaged by treasurers)
- No credit history for members
- No access to formal financial services or capital

**Solution:** A transparent, on-chain micro-lending pool built on Stellar/Soroban using a modified Blend Protocol. Members deposit stablecoins (USDC on Stellar testnet) into a shared pool, earn yield, and can borrow against their contributions. All logic lives on-chain. The UI is simple enough that a non-technical Ugandan user understands it in 30 seconds.

**Target user:** SACCO members, small business owners, and unbanked individuals in Uganda and East Africa.

---

## 📋 Submission Checklist

You must deliver ALL of the following:

| # | Deliverable | Details |
|---|-------------|---------|
| 1 | Deployed Soroban smart contract on Stellar testnet | At least one contract deployed and functional |
| 2 | Working UI accessible via live URL | Frontend deployed (Vercel/Netlify acceptable) |
| 3 | Public GitHub repository | With contract addresses and full README |
| 4 | 2-minute video script | Write a script the team can record |
| 5 | README.md | Covers what it does, how to run it, Stellar features used |

---

## 🏗️ Technical Tasks

### Step 1 — Understand the Cloned Blend Protocol

Before modifying anything:
1. Read the Blend Protocol README thoroughly
2. Identify the core contracts — specifically the **lending pool contract** and **token contract**
3. Understand what the `deposit`, `borrow`, `repay`, and `withdraw` functions do
4. Note any existing frontend in the repo (if present, reuse it)

Key Blend repos for reference:
- Smart contracts: `https://github.com/blend-capital/blend-contracts-v2`
- Utils/deployment: `https://github.com/blend-capital/blend-utils`

---

### Step 2 — Adapt the Smart Contracts

Modify the cloned Blend contracts to fit the SACCO use case. At minimum:

**Required changes:**
- Rename the pool to reflect the product (e.g., `SaccoPool`)
- Set the accepted asset to **USDC** (Stellar testnet USDC)
- Set a simple interest rate appropriate for micro-lending (e.g., 10% APR)
- Limit borrow amounts to a fraction of the pool (e.g., max borrow = 2x a member's deposit)
- Add a `get_member_stats(address)` view function that returns: deposit amount, borrow amount, available to borrow

**Document every change** in a `CHANGES.md` file at the root of the repo. The bootcamp requires forked repos to clearly document what was added or changed — failure to do this risks disqualification.

**Deploy to Stellar testnet:**
```bash
# Install Stellar CLI if not already installed
cargo install --locked stellar-cli --features opt

# Configure testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Fund a deployer account
stellar keys generate deployer
stellar keys fund deployer --network testnet

# Build contracts
cd contracts && cargo build --release --target wasm32-unknown-unknown

# Deploy (repeat for each contract)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/<contract_name>.wasm \
  --source deployer \
  --network testnet
```

Save all deployed contract addresses to a file called `CONTRACT_ADDRESSES.md`.

---

### Step 3 — Build the Frontend

Build a minimal, clean frontend. **Prioritize clarity over beauty** — a non-technical user must understand the product in 30 seconds.

**Tech stack:** Next.js + Tailwind CSS + `@stellar/stellar-sdk` + Freighter wallet integration

**Required screens/pages:**

1. **Home / Landing page**
   - Headline: what SaccoChain is in one sentence
   - CTA: "Connect Wallet" button (Freighter)
   - Stats: Total pool size, number of members, current APR

2. **Dashboard (after wallet connect)**
   - My deposit amount
   - My borrow amount
   - Available to borrow
   - Deposit button
   - Borrow button
   - Repay button

3. **Transaction flow**
   - Each action (deposit/borrow/repay) triggers a Soroban contract call
   - Show transaction hash and link to Stellar Explorer after each action
   - Handle errors gracefully with readable messages

**Wallet integration:**
```javascript
// Use Freighter wallet
import freighterApi from "@stellar/freighter-api";

const connectWallet = async () => {
  const publicKey = await freighterApi.getPublicKey();
  return publicKey;
};

// Sign and submit Soroban transactions
import { Contract, TransactionBuilder, Networks, SorobanRpc } from "@stellar/stellar-sdk";
```

**Deploy the frontend to Vercel or Netlify** and record the live URL.

---

### Step 4 — Write the README.md

The README must cover:

```markdown
# SaccoChain — On-Chain Micro-Lending for African SACCOs

## What it does
[2-3 sentences explaining the product and the problem it solves]

## Who it's for
[Target user — SACCO members, small business owners in Uganda/East Africa]

## How to run it locally
[Step-by-step setup instructions]

## Stellar features used
- Soroban smart contracts (lending pool logic)
- Stellar testnet USDC as the lending asset
- Freighter wallet for user authentication
- Soroban RPC for contract interaction

## Contract Addresses (Testnet)
- SaccoPool Contract: `C...`
- [Any other contracts]

## What was changed from Blend Protocol
See CHANGES.md for full diff summary.

## Team
[Team member names]
```

---

### Step 5 — Write the CHANGES.md

Every change from the original Blend Protocol must be documented here. Example format:

```markdown
# Changes from Blend Protocol (blend-capital/blend-contracts-v2)

## Smart Contract Changes
- Renamed pool to SaccoPool in `contracts/pool/src/lib.rs`
- Locked accepted asset to USDC testnet address
- Added `get_member_stats()` view function
- Set max borrow ratio to 2x member deposit
- Simplified interest rate model to flat 10% APR

## Frontend Changes
- Built new frontend from scratch (original Blend UI not used)
- Integrated Freighter wallet
- Simplified UX for non-technical users

## Removed Components
- [List anything from Blend you stripped out and why]
```

---

### Step 6 — Write the 2-Minute Video Script

Write a script for the team to record. Format:

```
[0:00 - 0:20] PROBLEM
"In Uganda, over 5 million people rely on informal savings groups — SACCOs — to 
access credit. But these groups are plagued by mismanagement, lack of transparency, 
and zero access to outside capital. People lose their savings with no recourse."

[0:20 - 0:35] SOLUTION
"SaccoChain puts the SACCO on-chain. Deposits, loans, and repayments are all 
handled by smart contracts on Stellar — transparent, automatic, and accessible 
from any smartphone."

[0:35 - 1:30] LIVE DEMO
[Screen share the live product]
- "Here I connect my Freighter wallet..."
- "I deposit 10 USDC into the pool..."
- "The contract shows I can now borrow up to 20 USDC..."
- "I take a loan — here's the transaction on Stellar Explorer..."
- "Any member can see the full pool balance and all activity in real time."

[1:30 - 1:50] WHO IT'S FOR & GROWTH PATH
"We're targeting SACCO treasurers and members in Uganda first. A SACCO with 
50 members could go fully on-chain in one afternoon. From there, we can onboard 
entire district-level SACCOs — that's thousands of users per group."

[1:50 - 2:00] CLOSE
"SaccoChain — transparent savings, trustless lending, built for Africa on Stellar."
```

---

## ⚖️ Judging Criteria Alignment

| Criterion | Points | How we score |
|-----------|--------|-------------|
| Technical execution | 10 | Blend contracts deployed + functional on testnet, code documented |
| Product & UX | 8 | Simple 3-screen UI, non-technical user understands in <30 sec |
| Problem & impact | 6 | Specific Uganda/East Africa SACCO problem, named target user |
| Stellar integration | 4 | Soroban lending pool, USDC asset, Freighter, contract calls |
| Pitch & communication | 2 | Script provided above, Q&A prep below |

---

## ❓ Q&A Prep (For Pitch Day)

Prepare answers to these likely judge questions:

**Q: Why Stellar instead of Ethereum?**
A: Stellar's transaction fees are fractions of a cent — critical for micro-lending where loan amounts can be as small as $10. Gas fees on Ethereum would eat the entire loan. Stellar also already has real-world adoption in East Africa through Flutterwave and ClickPesa.

**Q: How is this different from Blend Protocol?**
A: Blend is a general-purpose DeFi primitive. We've adapted it specifically for the SACCO model — limiting borrow ratios to member contributions, targeting USDC on Stellar, and building a UI designed for users who may never have used blockchain before.

**Q: How would real users onboard?**
A: A SACCO treasurer creates a pool, shares the link with members. Members connect with Freighter (available on mobile) and deposit. No KYC, no bank account required — only a smartphone and internet.

**Q: What's the path to more users?**
A: Start with 1 SACCO in Kampala as a pilot. If successful, approach the Uganda Cooperative Alliance which oversees 6,000+ registered SACCOs nationally.

---

## 🚀 Final Delivery Checklist

Before pitch day, confirm all of these are done:

- [ ] Smart contract deployed on Stellar testnet — address saved in `CONTRACT_ADDRESSES.md`
- [ ] `CHANGES.md` written documenting all modifications to Blend
- [ ] `README.md` complete with setup instructions and Stellar features
- [ ] Frontend deployed with live URL
- [ ] GitHub repo is **public**
- [ ] 2-minute video recorded and uploaded
- [ ] All links (video, live app, GitHub) submitted via the programme form **before Friday's session**
- [ ] At least one team member confirmed available for live Q&A on Friday

---

## ⚠️ Hard Rules (Do Not Violate)

1. **All code must be written during the build phase** — the Blend fork is the base, but all adaptations must be original work by the team
2. **CHANGES.md is mandatory** — copied projects without attribution are disqualified
3. **Contract must be on-chain** — no fake demos or off-chain backends pretending to be smart contracts
4. **Live link must work on pitch day** — test it the morning of Friday's session
5. **Submit all links before Friday's session begins** — late submissions are not admitted to the pitch slot

---

*Instructions prepared for the GDG UTAMU team — Stellar GIVE Impact Bootcamp 2026, Week 5.*
