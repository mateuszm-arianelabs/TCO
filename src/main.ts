import "dotenv/config";
import inquirer from 'inquirer';
import { CHAINS } from "./config/chains";
import SwapTCOFactory from "./swapTokens/swapTCOFactory";
import AddLiquidityTCOFactory from "./addLiquidity/AddLiquidityTCOFactory";
import NftTCOFactory from "./nftActions/nftTCOFactory";
import erc721Abi from "../contracts/exchange-protocol/data/abi/contracts/CustomERC721/MyNFT.json";
import { ActionType, ChainNames } from "./types";
import { benchmark } from "./utils/benchmark";

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const publicKey: `0x${string}` = "0xACD0BD350355336c5537dE56250Ef01eD61e73eB";
const artifactsPath = "./contracts/exchange-protocol/artifacts/contracts";
const erc721ContractAddress = process.env.ERC721_CONTRACT_ADDRESS as `0x${string}`;

async function showMenu() {
  console.clear();
  console.log('Welcome to the TCO Calculator! 🚀\n');

  if (!privateKey) {
    console.error("❌ Missing PRIVATE_KEY in environment variables");
    return;
  }

  if (!erc721ContractAddress) {
    console.error("❌ Missing ERC721_CONTRACT_ADDRESS in environment variables");
    return;
  }

  try {
    const { blockchain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'blockchain',
        message: 'Select a blockchain:',
        choices: [ChainNames.bsc, ChainNames.base, ChainNames.arbitrum, ChainNames.ethereum],
      },
    ]);

    const selectedChainKey = blockchain.toLowerCase();
    const config = CHAINS[selectedChainKey];

    if (!config) {
      console.clear();
      console.error(`❌ Invalid or unhandled blockchain selection: ${selectedChainKey}`);
      return;
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select a TCO action:',
        choices: [
          ActionType.addLiquidity,
          ActionType.swapTokens,
          ActionType.nftActions,
        ],
      },
    ]);

    // NFT 
    if (action === ActionType.nftActions) {
      const nftTCOImpl = await NftTCOFactory.createNftActionsTCO(
        config,
        privateKey,
        publicKey,
        erc721Abi,
        erc721ContractAddress
      );
      await benchmark(() => nftTCOImpl.executeNftActionsFlowTCO());
      return
    }

    // Swap
    if (action === ActionType.swapTokens) {
      const swapTCOImpl = await SwapTCOFactory.createSwapTCO(config, privateKey, publicKey, artifactsPath);
      await benchmark(() => swapTCOImpl.executeTokenSwapFlowTCO());
      return
    }

    // Add Liquidity
    if (action === ActionType.addLiquidity) {
      const addLiquidityTCOImpl = await AddLiquidityTCOFactory.createAddLiquidityTCO(config, privateKey, publicKey, artifactsPath);
      await benchmark(() => addLiquidityTCOImpl.executeAddLiquidityFlowTCO());
      return;
    }
  } catch (error) {
    console.error("❌ An error occurred:", error);
  }
}

void showMenu();