export const config = {
  rpcUrl:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ??
    "https://soroban-testnet.stellar.org",
  networkPassphrase:
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ??
    "Test SDF Network ; September 2015",
  poolContractId: process.env.NEXT_PUBLIC_POOL_CONTRACT_ID ?? "",
  usdcContractId:
    process.env.NEXT_PUBLIC_USDC_CONTRACT_ID ??
    "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  usdcReserveIndex: Number(
    process.env.NEXT_PUBLIC_USDC_RESERVE_INDEX ?? "0"
  ),
  targetApr: Number(process.env.NEXT_PUBLIC_TARGET_APR ?? "10"),
  explorerBase: "https://stellar.expert/explorer/testnet",
};

export function explorerTx(hash: string): string {
  return `${config.explorerBase}/tx/${hash}`;
}

export function requirePoolId(): string {
  if (!config.poolContractId || !config.poolContractId.startsWith("C")) {
    throw new Error(
      "NEXT_PUBLIC_POOL_CONTRACT_ID is not set. Add the deployed SaccoPool id to .env.local."
    );
  }
  return config.poolContractId;
}
