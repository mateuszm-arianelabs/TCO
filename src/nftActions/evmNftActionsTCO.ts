import { ChainConfig, CostEstimate } from "../types";
import {
  createPublicClient,
  http,
  formatUnits,
  PublicClient,
  Account,
  createWalletClient,
  WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { INftActionsTCO } from "./INftActionsTCO";
import { logCostEstimate } from '../utils/logCostEstimate';

class EvmNftActionsTCO implements INftActionsTCO {
  private publicClient: PublicClient;
  private client: WalletClient;
  private readonly account: Account;
  private readonly nativeCurrencySymbol: string;


  constructor(
    private config: ChainConfig,
    private privateKey: `0x${string}`,
    private publicKey: `0x${string}`,
    private nftAbi: any,
    private nftAddress: `0x${string}`,
    private nativeTokenUsdPrice: number,
  ) {
    this.account = privateKeyToAccount(this.privateKey);
    this.publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpc),
    });
    this.client = createWalletClient({
      account: this.account,
      chain: config.chain,
      transport: http(config.rpc),
    });

    this.nativeCurrencySymbol = config.chain.nativeCurrency.symbol;
  }

  /**
   * Calculates the cost of an operation given the gas used and the gas price.
   *
   * @param {bigint} gasUsed - The amount of gas used for the operation.
   * @param {bigint} gasPrice - The price of gas in wei.
   * @return {CostEstimate} An object containing the estimated cost in various formats, including:
   *                        gas used, gas price, cost in wei, cost in native currency, and cost in USD.
   */
  private calculateOperationCost(gasUsed: bigint, gasPrice: bigint): CostEstimate {
    const costInWei = gasUsed * gasPrice;
    const costInNativeCurrency = formatUnits(costInWei, this.config.chain.nativeCurrency.decimals);
    const costInUSD = (parseFloat(costInNativeCurrency) * this.nativeTokenUsdPrice).toFixed(6);

    return {
      gasUsed,
      gasPrice,
      costInWei,
      costInNativeCurrency,
      costInUSD
    };
  }

  private async estimateMint(gasPrice: bigint): Promise<CostEstimate> {
    try {
      const estimatedGas = await this.publicClient.estimateContractGas({
        address: this.nftAddress,
        abi: this.nftAbi,
        functionName: "safeMint",
        args: [this.publicKey],
        account: this.publicKey,
      });
      const cost = this.calculateOperationCost(estimatedGas, gasPrice);
      logCostEstimate("Mint NFT", cost, this.nativeCurrencySymbol);
      return cost;
    } catch (error) {
      console.error("Estimation failed (mint):", error);
      return {
        gasUsed: 0n,
        gasPrice,
        costInWei: 0n,
        costInNativeCurrency: '0',
        costInUSD: '0.00'
      };
    }
  }

  private async estimateBurn(gasPrice: bigint, tokenId: bigint): Promise<CostEstimate> {
    try {
      const estimatedGas = await this.publicClient.estimateContractGas({
        address: this.nftAddress,
        abi: this.nftAbi,
        functionName: "burn",
        args: [tokenId],
        account: this.publicKey,
      });
      const cost = this.calculateOperationCost(estimatedGas, gasPrice);
      logCostEstimate("Burn NFT", cost, this.nativeCurrencySymbol);
      return cost;
    } catch (error) {
      console.error("Estimation failed (burn):", error);
      return {
        gasUsed: 0n,
        gasPrice,
        costInWei: 0n,
        costInNativeCurrency: '0',
        costInUSD: '0.00'
      };
    }
  }

  private async estimateAirdrop(gasPrice: bigint, recipients: `0x${string}`[]): Promise<CostEstimate> {
    let totalGas = 0n;
    for (const recipient of recipients) {
      try {
        const estimatedGas = await this.publicClient.estimateContractGas({
          address: this.nftAddress,
          abi: this.nftAbi,
          functionName: "safeMint",
          args: [recipient],
          account: this.publicKey,
        });
        totalGas += estimatedGas;
      } catch (error) {
        console.error(`Estimation failed (airdrop for ${recipient}):`, error);
      }
    }
    const cost = this.calculateOperationCost(totalGas, gasPrice);
    logCostEstimate("Airdrop NFT", cost, this.nativeCurrencySymbol);
    return cost;
  }

  /**
   * Estimates gas and costs for mint, burn, and airdrop, then logs a cost overview.
   */
  async executeNftActionsFlowTCO(): Promise<void> {
    console.log(`🔍 Estimating NFT lifecycle operations (mint, burn, airdrop) on ${this.config.chain.name}...\n`);
    const gasPrice = await this.publicClient.getGasPrice();
    console.log(`Gas price: ${formatUnits(gasPrice, 9)} Gwei`);
    console.log(`USD per native token: $${this.nativeTokenUsdPrice.toFixed(2)}`);

    try {
      const mintCost = await this.estimateMint(gasPrice);
      const burnCost = await this.estimateBurn(gasPrice, 0n); // this is only estimation so we can safely pass 0n as an argument 

      const recipients = Array(10).fill(this.publicKey); // TODO: how many recipments? 
      const airdropCost = await this.estimateAirdrop(gasPrice, recipients);

      const totalGas = mintCost.gasUsed + burnCost.gasUsed + airdropCost.gasUsed;
      const totalWei = mintCost.costInWei + burnCost.costInWei + airdropCost.costInWei;
      const totalNative = formatUnits(totalWei, this.config.chain.nativeCurrency.decimals);
      const totalUSD = (parseFloat(totalNative) * this.nativeTokenUsdPrice).toFixed(6);

      console.log(`\n=== TOTAL COST OVERVIEW ===`);
      console.log(`Total gas: ${totalGas.toString()}`);
      console.log(`Total in ${this.nativeCurrencySymbol}: ${totalNative}`);
      console.log(`Total in USD: $${totalUSD}`);

    } catch (err) {
      console.error("❌ Estimation failed:", err);
    }
  }

}


export default EvmNftActionsTCO;
