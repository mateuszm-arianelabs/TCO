import {ChainConfig} from "./types";
import {Account, createPublicClient, createWalletClient, formatUnits, Hex, http} from "viem";
import {privateKeyToAccount} from "viem/accounts";
import path from "node:path";
import fs from "node:fs/promises";
import {encodeDeployData} from "viem/utils";

const ARTIFACTS_PATH = "./artifacts/contracts/exchange-protocol/contracts";

type PublicClient = ReturnType<typeof createPublicClient>

async function fetchBNBPrice(): Promise<number> {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
    const data = await response.json();
    return data.binancecoin.usd;
}

async function estimateFactoryDeployment(
    gasPrice: bigint,
    bnbUsdPrice: number,
    publicKey: string,
    publicClient: PublicClient,
    account: Account
) {
    const factoryContractPath = path.join(ARTIFACTS_PATH, "PancakeFactory.sol/PancakeFactory.json")
    const factoryContractArtifact = await fs.readFile(factoryContractPath, "utf-8")
    const factoryContract = JSON.parse(factoryContractArtifact);
    const factoryContractAbi = factoryContract["abi"];
    const factoryContractBytecode = factoryContract["bytecode"];


    const deployFactoryData = encodeDeployData({
        abi: factoryContractAbi,
        bytecode: factoryContractBytecode,
        args: [publicKey],
    })

    const deployFactoryEstimatedGas = await publicClient.estimateGas({
        account,
        data: deployFactoryData,
    })

    return deployFactoryEstimatedGas;
}

export async function addLiquidityTCO(privateKey: string, publicKey: string, config: ChainConfig) {
    console.log("🔍 Starting costs estimation for swap contracts...\n");

    const account = privateKeyToAccount(<Hex>privateKey);

    const publicClient = createPublicClient({
        chain: config.chain,
        transport: http(config.rpc),
    })

    const client = createWalletClient({
        account,
        chain: config.chain,
        transport: http(config.rpc),
    })

    // Fetch current gas price and BNB USD price
    const [gasPrice, bnbUsdPrice] = await Promise.all([
        publicClient.getGasPrice(),
        fetchBNBPrice()
    ]);

    console.log(`Current gas price: ${formatUnits(gasPrice, 9)} Gwei`);
    console.log(`BNB price (USD): ${bnbUsdPrice.toFixed(3)}`);

    try {
        // Estimate each operation
        const factoryDeployment = await estimateFactoryDeployment(gasPrice, bnbUsdPrice, publicKey, publicClient, account);
        console.log(factoryDeployment);
        // const createPair = await estimateCreatePair(gasPrice, bnbUsdPrice);
        // const routerDeployment = await estimateRouterDeployment(gasPrice, bnbUsdPrice);
        // const tokenApproval = await performTokenApproval(bnbUsdPrice); // this action cannot be estimated and it's mainnet cost must be paid
        // const tokenSwap = await estimateTokenSwap(gasPrice, bnbUsdPrice);
        //
        // // Calculate total costs
        // const totalGasUsed = factoryDeployment.gasUsed +
        //     createPair.gasUsed +
        //     routerDeployment.gasUsed +
        //     tokenApproval.gasUsed +
        //     tokenSwap.gasUsed;
        //
        // const totalCostInWei = factoryDeployment.costInWei +
        //     createPair.costInWei +
        //     routerDeployment.costInWei +
        //     tokenApproval.costInWei +
        //     tokenSwap.costInWei;
        //
        // const totalCostInBNB = formatUnits(totalCostInWei, 18);
        // const totalCostInUSD = (parseFloat(totalCostInBNB) * bnbUsdPrice).toFixed(6);
        //
        // console.log(`\n=== TOTAL COST OVERVIEW (TCO) ===`);
        // console.log(`Total gas used: ${totalGasUsed.toString()}`);
        // console.log(`Total cost in BNB: ${totalCostInBNB}`);
        // console.log(`Total cost in USD: ${totalCostInUSD}`);
        //
        // // Breakdown by operation
        // console.log(`\n=== COST BREAKDOWN ===`);
        // console.log(`Factory Deployment: ${factoryDeployment.costInBNB} BNB ($${factoryDeployment.costInUSD})`);
        // console.log(`Create Pair: ${createPair.costInBNB} BNB (${createPair.costInUSD})`);
        // console.log(`Router Deployment: ${routerDeployment.costInBNB} BNB ($${routerDeployment.costInUSD})`);
        // console.log(`Token Approval: ${tokenApproval.costInBNB} BNB ($${tokenApproval.costInUSD})`);
        // console.log(`Token Swap: ${tokenSwap.costInBNB} BNB ($${tokenSwap.costInUSD})`);

    } catch (error) {
        console.error("❌ Error during gas estimation:", error);
    }
}