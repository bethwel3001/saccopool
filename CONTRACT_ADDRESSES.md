# SaccoChain — Deployed Contract Addresses

> **Network:** Stellar Testnet
> **RPC:** https://soroban-testnet.stellar.org
> **Passphrase:** `Test SDF Network ; September 2015`
> **Deployed:** 2026-06-04

## Live deployment

| Component | Contract ID / Hash | Notes |
|-----------|-------------------|-------|
| **SaccoPool** (pool.wasm) | `CBY2WIY6JI2VIJKOYK6JTCVZEEQ34Z3PBXBQH5RZYSKSSB7RJXAW7DDF` | Constructor `name = "SaccoPool"` |
| Pool wasm hash | `68bcc93f82241162e7332f4fff5258a4eb036331c3590d2109df4c905fc56534` | Uploaded by `deployer` |
| Testnet USDC SAC | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` | Standard testnet USDC |

### Verify on Stellar Expert

- SaccoPool contract: <https://stellar.expert/explorer/testnet/contract/CBY2WIY6JI2VIJKOYK6JTCVZEEQ34Z3PBXBQH5RZYSKSSB7RJXAW7DDF>
- Deploy transaction: <https://stellar.expert/explorer/testnet/tx/eb4e7d406fbbe7762d077d9ab4fd32db183f474bc28040eee76fa83dec7680ba>

### Verify the SaccoChain modification

The new `get_member_stats(address, asset)` view added in this fork is live and callable
on-chain. Confirm with:

```bash
stellar contract invoke \
  --id CBY2WIY6JI2VIJKOYK6JTCVZEEQ34Z3PBXBQH5RZYSKSSB7RJXAW7DDF \
  --source deployer --network testnet \
  -- get_admin
# → "GDNFD6KPYXLREUV7TDOSKLWH7HYF6U42P644NSD42XRQPVH4QYAIQFQZ"

stellar contract invoke \
  --id CBY2WIY6JI2VIJKOYK6JTCVZEEQ34Z3PBXBQH5RZYSKSSB7RJXAW7DDF \
  --source deployer --network testnet \
  -- get_member_stats \
  --address GDNFD6KPYXLREUV7TDOSKLWH7HYF6U42P644NSD42XRQPVH4QYAIQFQZ \
  --asset CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
# Symbol exists on-chain; returns Storage::MissingValue until USDC is queued as a
# reserve (queueing a reserve requires the full Blend backstop infrastructure —
# out of scope for the bootcamp demo deployment).
```

## Deployer

| Item | Value |
|------|-------|
| Deployer key alias | `deployer` |
| Deployer G-address | `GDNFD6KPYXLREUV7TDOSKLWH7HYF6U42P644NSD42XRQPVH4QYAIQFQZ` |

## Deployment scope

This is the minimal demo deployment for the Stellar GIVE Impact Bootcamp 2026:

- The **SaccoPool** contract is deployed to Stellar testnet and its on-chain interface —
  including the SaccoChain-added `get_member_stats` view — is verifiable on Stellar Expert.
- A **full production deployment** would additionally require initializing the Blend
  emitter, BLND token, BLND-USDC LP (Comet) pool, backstop module, pool factory, and a
  price oracle, then seeding the backstop with LP tokens to meet the activation
  threshold. Those steps are handled by the
  [`blend-utils`](https://github.com/blend-capital/blend-utils) TypeScript scripts and are
  out of scope for this bootcamp submission.
