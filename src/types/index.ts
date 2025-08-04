import { Address, Chain } from "viem";

export interface ChainConfig {
  chain: Chain
  name: ChainNames,
  rpc: string
  factory: Address
  router: Address
  weth: TokenConfig
  operationToken1: TokenConfig
  operationToken2: TokenConfig
  newToken1: TokenConfig
  newToken2: TokenConfig
}

export interface TokenConfig {
  address: Address,
  decimals: number,
}

export interface CostEstimate {
  gasUsed: bigint;
  gasPrice: bigint;
  costInWei: bigint;
  costInNativeCurrency: string;
  costInUSD: string;
}

export enum ChainNames {
  arbitrum = "arbitrum",
  base = "base",
  bsc = "bsc",
  ethereum = "ethereum",
  solana = "solana",
  tron = "tron",
  hedera = "hedera",
}

export enum ActionType {
  addLiquidity = "Add Liquidity",
  swapTokens = "Swap Tokens",
}