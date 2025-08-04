import { ChainConfig } from "../types";
import {
  Account,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  http,
  parseUnits,
  PublicClient, WalletClient
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import path from "node:path";
import fs from "node:fs/promises";
import { encodeDeployData } from "viem/utils";
import { CostEstimate } from "../types";

class EvmSwapTokensTCO implements ISwapTokensTCO {
  private publicClient: PublicClient;
  private client: WalletClient;
  private readonly account: Account;
  private readonly nativeCurrencySymbol: string;

  constructor(
    private config: ChainConfig,
    private privateKey: `0x${string}`,
    private publicKey: `0x${string}`,
    private artifactPath: string,
    private nativeCurrencyUsdPrice: number
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

  private logCostEstimate(operation: string, gasEstimate: CostEstimate): void {
    console.log(`\n=== ${operation} ===`);
    console.log(`Gas used: ${gasEstimate.gasUsed.toString()}`);
    console.log(`Gas price: ${formatUnits(gasEstimate.gasPrice, 9)} Gwei`);  // this works fine as all the used chains have native tokens with 18 decimals
    console.log(`Cost in ${this.nativeCurrencySymbol}: ${gasEstimate.costInNativeCurrency}`);
    console.log(`Cost in USD: $${gasEstimate.costInUSD}`);
  }

  private calculateOperationCost(gasUsed: bigint, gasPrice: bigint): CostEstimate {
    const costInWei = gasUsed * gasPrice;
    const costInNativeCurrency = formatUnits(costInWei, this.config.chain.nativeCurrency.decimals);
    const costInUSD = (parseFloat(costInNativeCurrency) * this.nativeCurrencyUsdPrice).toFixed(6);

    return {
      gasUsed,
      gasPrice,
      costInWei,
      costInNativeCurrency,
      costInUSD
    };
  }

  private async estimateFactoryDeployment(gasPrice: bigint): Promise<CostEstimate> {
    const factoryContractPath = path.join(this.artifactPath, "PancakeFactory.sol/PancakeFactory.json");
    const factoryContractArtifact = await fs.readFile(factoryContractPath, "utf-8");
    const factoryContract = JSON.parse(factoryContractArtifact);
    const deployData = encodeDeployData({
      abi: factoryContract.abi,
      bytecode: factoryContract.bytecode,
      args: [this.publicKey],
    });

    const estimatedGas = await this.publicClient.estimateGas({
      account: this.account,
      data: deployData,
    });

    const cost = this.calculateOperationCost(estimatedGas, gasPrice);
    this.logCostEstimate("Factory Deployment", cost);
    return cost;
  }

  private async estimateCreatePair(gasPrice: bigint): Promise<CostEstimate> {
    const factoryContractPath = path.join(this.artifactPath, "PancakeFactory.sol/PancakeFactory.json");
    const artifact = await fs.readFile(factoryContractPath, "utf-8");
    const factoryContract = JSON.parse(artifact);

    const estimatedGas = await this.publicClient.estimateContractGas({
      account: this.account,
      abi: factoryContract.abi,
      address: this.config.factory,
      functionName: 'createPair',
      args: [this.config.newToken1.address, this.config.newToken2.address]
    });

    const cost = this.calculateOperationCost(estimatedGas, gasPrice);
    this.logCostEstimate("Create Pair", cost);
    return cost;
  }

  private async estimateRouterDeployment(gasPrice: bigint): Promise<CostEstimate> {
    const routerContractPath = path.join(this.artifactPath, "PancakeRouter.sol/PancakeRouter.json");
    const artifact = await fs.readFile(routerContractPath, "utf-8");
    const routerContract = JSON.parse(artifact);

    const deployData = encodeDeployData({
      abi: routerContract.abi,
      bytecode: routerContract.bytecode,
      args: [this.config.factory, this.config.weth.address],
    });

    const estimatedGas = await this.publicClient.estimateGas({
      account: this.account,
      data: deployData,
    });

    const cost = this.calculateOperationCost(estimatedGas, gasPrice);
    this.logCostEstimate("Router Deployment", cost);
    return cost;
  }

  private async performTokenApproval(): Promise<CostEstimate> {
    const amountIn = parseUnits('0.1', this.config.operationToken1.decimals);

    const txHash = await this.client.writeContract({
      address: this.config.operationToken1.address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [this.config.router, amountIn],
      chain: this.config.chain,
      account: this.account,
    });

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
    const gasPrice = receipt.effectiveGasPrice as bigint;
    const cost = this.calculateOperationCost(receipt.gasUsed, gasPrice);

    this.logCostEstimate("Token Approval", cost);
    return cost;
  }

  private async estimateTokenSwap(gasPrice: bigint): Promise<CostEstimate> {
    const routerContractPath = path.join(this.artifactPath, "PancakeRouter.sol/PancakeRouter.json");
    const artifact = await fs.readFile(routerContractPath, "utf-8");
    const routerContract = JSON.parse(artifact);

    const amountIn = parseUnits('0.1',  this.config.operationToken1.decimals);
    const amountOutMin = 0; // setting minimal out amount to 0 to fix an issue with fluctuating prices causing errors

    const pathTokens = [this.config.operationToken1.address, this.config.operationToken2.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const estimatedGas = await this.publicClient.estimateContractGas({
      account: this.account,
      abi: routerContract.abi,
      address: this.config.router,
      functionName: 'swapExactTokensForTokens',
      args: [amountIn, amountOutMin, pathTokens, this.publicKey, deadline]
    });

    const cost = this.calculateOperationCost(estimatedGas, gasPrice);
    this.logCostEstimate("Token Swap", cost);
    return cost;
  }

  async executeTokenSwapFlowTCO(): Promise<void> {
    console.log(`🔍 Estimating swap operations on ${this.config.chain.name}...\n`);

    const gasPrice = await this.publicClient.getGasPrice();
    console.log(`Gas price: ${formatUnits(gasPrice, 9)} Gwei`); // this works fine as all the used chains have native tokens with 18 decimals
    console.log(`USD per native token: $${this.nativeCurrencyUsdPrice.toFixed(2)}`);

    try {
      const factoryDeployment = await this.estimateFactoryDeployment(gasPrice);
      const createPair = await this.estimateCreatePair(gasPrice);
      const routerDeployment = await this.estimateRouterDeployment(gasPrice);
      const tokenApproval = await this.performTokenApproval();
      const tokenSwap = await this.estimateTokenSwap(gasPrice);

      const totalGas = factoryDeployment.gasUsed +
        createPair.gasUsed +
        routerDeployment.gasUsed +
        tokenApproval.gasUsed +
        tokenSwap.gasUsed;

      const totalWei = factoryDeployment.costInWei +
        createPair.costInWei +
        routerDeployment.costInWei +
        tokenApproval.costInWei +
        tokenSwap.costInWei;

      const totalNativeCurrency = formatUnits(totalWei, this.config.chain.nativeCurrency.decimals);
      const totalUSD = (parseFloat(totalNativeCurrency) * this.nativeCurrencyUsdPrice).toFixed(6);

      console.log(`\n=== TOTAL COST OVERVIEW ===`);
      console.log(`Total gas: ${totalGas.toString()}`);
      console.log(`Total in ${this.nativeCurrencySymbol}: ${totalNativeCurrency}`);
      console.log(`Total in USD: $${totalUSD}`);
    } catch (err) {
      console.error("❌ Estimation failed:", err);
    }
  }
}

export default EvmSwapTokensTCO;
