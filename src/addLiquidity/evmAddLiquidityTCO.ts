import { ChainConfig, TokenConfig } from "../types";
import { privateKeyToAccount } from "viem/accounts";
import {
  Account,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  http,
  parseUnits,
  PublicClient,
  WalletClient
} from "viem";
import path from "node:path";
import fs from "node:fs/promises";
import { encodeDeployData } from "viem/utils";
import { CostEstimate } from "../types";

class EvmAddLiquidityTCO implements IAddLiquidityTCO {
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
    console.log(`Gas price: ${formatUnits(gasEstimate.gasPrice, 9)} Gwei`);
    console.log(`Cost in ${this.nativeCurrencySymbol}: ${gasEstimate.costInNativeCurrency}`);
    console.log(`Cost in USD: $${gasEstimate.costInUSD}`);
  }

  /**
   * Calculates the operation cost based on gas used and gas price.
   *
   * @param {bigint} gasUsed - The amount of gas used in the operation.
   * @param {bigint} gasPrice - The price of gas in wei.
   * @return {CostEstimate} An object containing the detailed cost estimate, including:
   *                        - gasUsed: The gas used.
   *                        - gasPrice: The gas price.
   *                        - costInWei: The total cost in wei.
   *                        - costInNativeCurrency: The total cost in the chain's native currency.
   *                        - costInUSD: The estimated cost in USD.
   */
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

  /**
   * Estimates the deployment cost for the factory contract based on the provided gas price.
   *
   * @param gasPrice The gas price to be used for estimating the cost, provided as a bigint.
   * @return A promise that resolves to a CostEstimate object containing the estimated deployment cost.
   */
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

  /**
   * Estimates the cost to create a trading pair for two tokens on the factory contract.
   *
   * @param {bigint} gasPrice - The gas price to be used for the transaction estimation.
   * @param {TokenConfig} token1 - Configuration object for the first token, including its address.
   * @param {TokenConfig} token2 - Configuration object for the second token, including its address.
   * @return {Promise<CostEstimate>} A promise that resolves to an object containing the estimated cost of the operation.
   */
  private async estimateCreatePair(gasPrice: bigint, token1: TokenConfig, token2: TokenConfig): Promise<CostEstimate> {
    const factoryContractPath = path.join(this.artifactPath, "PancakeFactory.sol/PancakeFactory.json");
    const artifact = await fs.readFile(factoryContractPath, "utf-8");
    const factoryContract = JSON.parse(artifact);

    const estimatedGas = await this.publicClient.estimateContractGas({
      account: this.account,
      abi: factoryContract.abi,
      address: this.config.factory,
      functionName: 'createPair',
      args: [token1.address, token2.address]
    });

    const cost = this.calculateOperationCost(estimatedGas, gasPrice);
    this.logCostEstimate("Create Pair", cost);
    return cost;
  }

  /**
   * Estimates the deployment cost of the router contract.
   *
   * @param gasPrice The gas price to use for the cost estimation, provided as a bigint.
   * @return A Promise that resolves to the estimated cost of deploying the router contract as a CostEstimate object.
   */
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

  /**
   * Approves a specified token for spending by the configured router address.
   *
   * @param {TokenConfig} token - The configuration object for the token to approve, including its address and decimals.
   * @return {Promise<CostEstimate>} A promise that resolves to the cost estimate of the token approval operation.
   */
  private async performTokenApproval(token: TokenConfig): Promise<CostEstimate> {
    const amountIn = parseUnits('0.1', token.decimals);

    const txHash = await this.client.writeContract({
      address: token.address,
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

  /**
   * Estimates the gas and associated cost required to add liquidity for two tokens using a decentralized exchange router contract.
   *
   * @param gasPrice The current gas price as a `bigint`.
   * @param token1 The configuration for the first token, including its address and decimals.
   * @param token2 The configuration for the second token, including its address and decimals.
   * @return A promise that resolves to a `CostEstimate` object containing details about the estimated operation cost.
   */
  private async estimateAddLiquidity(gasPrice: bigint, token1: TokenConfig, token2: TokenConfig): Promise<CostEstimate> {
    const routerContractPath = path.join(this.artifactPath, "PancakeRouter.sol/PancakeRouter.json");
    const artifact = await fs.readFile(routerContractPath, "utf-8");
    const routerContract = JSON.parse(artifact);

    const amountInTok1 = parseUnits('0.01', token1.decimals);
    const amountInTok2 = parseUnits('0.01', token2.decimals);

    // setting minimal out amount to 0 to fix an issue with fluctuating prices causing errors
    const amountOutMinTok1 = parseUnits('0', token1.decimals);
    const amountOutMinTok2 = parseUnits('0', token2.decimals);

    const estimatedGas = await this.publicClient.estimateContractGas({
      account: this.account,
      abi: routerContract.abi,
      address: this.config.router,
      functionName: 'addLiquidity',
      args: [
        token1.address,
        token2.address,
        amountInTok1,
        amountInTok2,
        amountOutMinTok1,
        amountOutMinTok2,
        this.publicKey,
        Math.floor(Date.now() / 1000) + 60 * 20, // deadline
      ]
    });

    const cost = this.calculateOperationCost(estimatedGas, gasPrice);
    this.logCostEstimate("Add Liquidity", cost);
    return cost;
  }

  /**
   * Executes the process of estimating and performing the required steps to add liquidity in a specified blockchain environment.
   * This includes operations such as estimating gas costs for factory deployment, pair creation, router deployment, token approvals,
   * and liquidity addition while calculating total gas usage and cost in both native currency and USD.
   *
   * @return {Promise<void>} A promise that resolves once all the liquidity addition steps and calculations are executed.
   */
  async executeAddLiquidityFlowTCO(): Promise<void> {
    console.log(`🔍 Estimating adding liquidity operations on ${this.config.chain.name}...\n`);

    const gasPrice = await this.publicClient.getGasPrice();
    console.log(`Gas price: ${formatUnits(gasPrice, 9)} Gwei`);  // this works fine as all the used chains have native tokens with 18 decimals
    console.log(`USD per native token: $${this.nativeCurrencyUsdPrice.toFixed(2)}`);

    try {
      const factoryDeployment = await this.estimateFactoryDeployment(gasPrice);
      const createPair = await this.estimateCreatePair(gasPrice, this.config.newToken1, this.config.newToken2);
      const routerDeployment = await this.estimateRouterDeployment(gasPrice);
      const tokenApproval1 = await this.performTokenApproval(this.config.operationToken1);
      const tokenApproval2 = await this.performTokenApproval(this.config.operationToken2);

      const addLiquidity = await this.estimateAddLiquidity(gasPrice, this.config.operationToken1, this.config.operationToken2);

      const totalGas = factoryDeployment.gasUsed +
        createPair.gasUsed +
        routerDeployment.gasUsed +
        tokenApproval1.gasUsed +
        tokenApproval2.gasUsed +
        addLiquidity.gasUsed;

      const totalWei = factoryDeployment.costInWei +
        createPair.costInWei +
        routerDeployment.costInWei +
        tokenApproval1.costInWei +
        tokenApproval2.costInWei +
        addLiquidity.costInWei;

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

export default EvmAddLiquidityTCO;