import { ChainConfig } from "../types";
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
  private account: Account;

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
  }

  async executeMintFlowTCO(): Promise<void> {
    try {
      const estimatedGas = await this.publicClient.estimateContractGas({
        address: this.nftAddress,
        abi: this.nftAbi,
        functionName: "safeMint",
        args: [this.publicKey],
        account: this.publicKey,
      });
      const gasPrice = await this.publicClient.getGasPrice();
      const costInWei = estimatedGas * gasPrice;
      const costInNativeCurrency = formatUnits(costInWei, this.config.chain.nativeCurrency.decimals);
      const costInUSD = (parseFloat(costInNativeCurrency) * this.nativeTokenUsdPrice).toFixed(6);

      const estimate = {
        gasUsed: estimatedGas,
        gasPrice,
        costInWei,
        costInNativeCurrency,
        costInUSD
      };

      logCostEstimate("Mint NFT", estimate, this.config.chain.nativeCurrency.symbol);

    } catch (error) {
      console.error("Estimation failed (mint):", error);
    }
  }

  async executeBurnFlowTCO(): Promise<void> {
    const tokenId = 0n;
    try {
      const estimatedGas = await this.publicClient.estimateContractGas({
        address: this.nftAddress,
        abi: this.nftAbi,
        functionName: "burn",
        args: [tokenId],
        account: this.publicKey,
      });
      const gasPrice = await this.publicClient.getGasPrice();
      const costInWei = estimatedGas * gasPrice;
      const costInNativeCurrency = formatUnits(costInWei, this.config.chain.nativeCurrency.decimals);
      const costInUSD = (parseFloat(costInNativeCurrency) * this.nativeTokenUsdPrice).toFixed(6);

      const estimate = {
        gasUsed: estimatedGas,
        gasPrice,
        costInWei,
        costInNativeCurrency,
        costInUSD
      };

      logCostEstimate("Burn NFT", estimate, this.config.chain.nativeCurrency.symbol);

    } catch (error) {
      console.error("Estimation failed (burn):", error);
    }
  }

  async executeAirdropFlowTCO(): Promise<void> {
    const recipients = [
      this.publicKey,
      // TODO: other addressess?
    ];
    let totalGas = 0n;
    const gasPrice = await this.publicClient.getGasPrice();
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
    const totalCost = totalGas * gasPrice;
    console.log(`Total estimated gas for airdrop: ${totalGas}`);
    console.log(`Cost in native: ${formatUnits(totalCost, this.config.chain.nativeCurrency.decimals)}`);
  }
}

export default EvmNftActionsTCO;
