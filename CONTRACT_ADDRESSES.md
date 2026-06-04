# SaccoChain — Deployed Contract Addresses

> **Network:** Stellar Testnet
> **RPC:** https://soroban-testnet.stellar.org
> **Passphrase:** `Test SDF Network ; September 2015`

## Live deployment — full Soroban stack

The entire SaccoChain stack is deployed and **fully operational** on Stellar testnet
— users can `supply`, `supply_collateral`, `borrow`, `withdraw`, and `repay` against
the real testnet USDC SAC.

| Component | Contract ID |
|-----------|-------------|
| **SaccoPool** (live, status = On-Ice = all actions allowed) | `CD4RQJIJVOTJVTQQSVWE3MUDWZAAWUXLVRXBSDDTJGMPWHEGFZJO7BY5` |
| Pool Factory | `CBYJBWKRGTRLAKV3SDLEC6HGLID26TS5KP4TY73GAOIDGPPPYONIG24N` |
| Backstop | `CBZ7WVMANHDCPCCRDLYSVYCQDWP5R2CMS6V7OUYAE74AUGANYWV7SSH2` |
| Emitter | `CCFAPHDSW72YT764J2EX3KQOCYSZSBBNZC7AVKKC5UJOP2W5QIGXLPEU` |
| Oracle (USD base, $1.00 USDC) | `CABCB33FHJLJKM6Z63VHDH6RDIC4LCJWZELQILTKYXC6OJEOOOXCRSHV` |
| Comet LP (BLND/BUSDC 80/20) | `CDD27JMR645AQFTTIHGA3MACEY3HMOOV6ZJ4S3HUU4NYGXNC4LPKXX22` |
| BLND token SAC | `CCBKBPBHRF6TIZ4XPH7QTNM2PM25RSLPNZ3MOSZ27AQQVOKPFT5L5JMX` |
| Backstop USDC SAC | `CA5KJ7U34SLO3IEJLSL7WY73ZKEZVSZYIQYD2M3SY63AESDTBJOXQSTY` |
| Real USDC (reserve asset) | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |

### Wasm hashes

| Wasm | Hash |
|------|------|
| pool | `cbfcbfb748505acb269d25d083914247f01d569b96fd9ec50cb44a7579dca5f0` |
| backstop | `eef956ba07f26f5f1186330a4f14a3923193ca1829a24eb6a526793e64bf6d91` |
| pool_factory | `80abaf3c68fd15adade9f82165baa9b50d85800e497c99b45809e1fbd7397de2` |
| emitter | `438a5528cff17ede6fe515f095c43c5f15727af17d006971485e52462e7e7b89` |
| oracle | `c626b16160c3e3a48e21294acecbc0e2c4ec5a8e81c2ca35d86e8abe28d9256e` |
| comet | `5d721fa580714291f6846fc01738e86d70acb47e449ea75312e272a0f7436dd8` |

## Verify on-chain

```bash
# 1. Pool config (status:1 = On-Ice, all SaccoChain actions allowed)
stellar contract invoke \
  --id CD4RQJIJVOTJVTQQSVWE3MUDWZAAWUXLVRXBSDDTJGMPWHEGFZJO7BY5 \
  --source deployer --network testnet \
  -- get_config
# → {"bstop_rate":1000000,"max_positions":6,"min_collateral":"10000000",
#    "oracle":"CABCB33F...","status":1}

# 2. SaccoChain custom view (new in this fork)
stellar contract invoke \
  --id CD4RQJIJVOTJVTQQSVWE3MUDWZAAWUXLVRXBSDDTJGMPWHEGFZJO7BY5 \
  --source deployer --network testnet \
  -- get_member_stats \
  --address GDNFD6KPYXLREUV7TDOSKLWH7HYF6U42P644NSD42XRQPVH4QYAIQFQZ \
  --asset CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
# → MemberStats { deposit, borrow, available_to_borrow = max(0, 2*deposit - borrow) }
```

### Stellar Expert

- SaccoPool: <https://stellar.expert/explorer/testnet/contract/CD4RQJIJVOTJVTQQSVWE3MUDWZAAWUXLVRXBSDDTJGMPWHEGFZJO7BY5>
- Pool Factory: <https://stellar.expert/explorer/testnet/contract/CBYJBWKRGTRLAKV3SDLEC6HGLID26TS5KP4TY73GAOIDGPPPYONIG24N>
- Backstop: <https://stellar.expert/explorer/testnet/contract/CBZ7WVMANHDCPCCRDLYSVYCQDWP5R2CMS6V7OUYAE74AUGANYWV7SSH2>

## Deployer

| Item | Value |
|------|-------|
| Deployer alias | `deployer` |
| Deployer G-address | `GDNFD6KPYXLREUV7TDOSKLWH7HYF6U42P644NSD42XRQPVH4QYAIQFQZ` |

## Activation sequence

1. Issued fake **BLND** and **BUSDC** classic assets (deployer = issuer), wrapped as SACs.
2. Deployed emitter, oracle (mock SEP-40), Comet LP (80% BLND / 20% BUSDC).
3. Pre-computed backstop & pool_factory addresses via deterministic salts to resolve the circular dependency, then deployed both with full constructor args.
4. Initialised emitter (`blnd_token`, `backstop`, `backstop_token=LP`) and transferred BLND SAC admin to the emitter.
5. Initialised the Comet LP with a 1,000 BLND + 25 BUSDC seed; deployer then `join_pool`'d with 110M BLND + 2.6M BUSDC to mint 10M LP shares.
6. `backstop.drop()` + `backstop.distribute()`.
7. Configured the oracle (USD base, $1.00 USDC).
8. Deployed SaccoPool via `pool_factory.deploy(..., backstop_take_rate=10%, max_positions=6, min_collateral=1 USDC)`.
9. `backstop.deposit(50,000 LP shares)` to meet the activation threshold; `backstop.add_reward(pool)`.
10. Queued the real testnet USDC reserve (no timelock in pool status 6 / Setup) and immediately called `set_reserve`.
11. `pool.set_status(3)` → `pool.update_status()` → pool reaches **status 1 (On-Ice)** at which all SaccoChain user actions (supply, supply_collateral, withdraw, withdraw_collateral, borrow, repay) are allowed.
