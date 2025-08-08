import "dotenv/config";
import inquirer from 'inquirer';
import { CHAINS } from "./config/chains";
import SwapTCOFactory from "./swapTokens/swapTCOFactory";
import AddLiquidityTCOFactory from "./addLiquidity/AddLiquidityTCOFactory";
import NftTCOFactory from "./nftActions/nftTCOFactory";
import { ActionType, ChainNames } from "./types";
import { benchmark } from "./utils/benchmark";
import { artifactsPath, erc721HederaContractAddress, erc721SepoliaContractAddress, privateKey, publicKey } from './constants';

async function showMenu() {
  console.clear();
  console.log('Welcome to the TCO Calculator! 🚀\n');

  if (!privateKey) {
    console.error("❌ Missing PRIVATE_KEY in environment variables");
    return;
  }

  if (!erc721SepoliaContractAddress) {
    console.error("❌ Missing ERC721_SEPOLIA_CONTRACT_ADDRESS in environment variables");
    return;
  }

  if (!erc721HederaContractAddress) {
    console.error("❌ Missing ERC721_HEDERA_CONTRACT_ADDRESS in environment variables");
    return;
  }

  try {
    const { blockchain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'blockchain',
        message: 'Select a blockchain:',
        choices: [ChainNames.bsc, ChainNames.base, ChainNames.arbitrum, ChainNames.ethereum, ChainNames.hedera],
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